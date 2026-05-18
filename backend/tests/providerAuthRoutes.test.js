// backend/tests/providerAuthRoutes.test.js
import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

// ================================
// Mock dependencies
// ================================

const mockVerifyIdToken = jest.fn();

const mockSupabase = {
  from: jest.fn(),
  auth: {
    signUp: jest.fn(),
  },
};

const mockSendVerificationEmail = jest.fn();
const mockGenerateJWT = jest.fn(() => "mock-jwt-token");

jest.unstable_mockModule("google-auth-library", () => ({
  OAuth2Client: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: mockSupabase,
}));

jest.unstable_mockModule("../src/services/emailService.js", () => ({
  default: mockSendVerificationEmail,
}));

jest.unstable_mockModule("../src/utils/generateJWT.js", () => ({
  default: mockGenerateJWT,
}));

// Import router AFTER mocks
const providerAuthRoutes = (
  await import("../src/routes/providerAuthRoutes.js")
).default;

describe("providerAuthRoutes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();

    app.use(express.json());

    // Mock session middleware
    app.use((req, res, next) => {
      req.session = {};
      next();
    });

    app.use("/auth", providerAuthRoutes);

    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-123",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/avatar.png",
      }),
    });
  });

  describe("POST /check-user", () => {
    test("returns existing user data", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                role: "provider",
              },
            }),
          }),
        }),
      });

      const res = await request(app)
        .post("/auth/check-user")
        .send({
          token: "google-token",
          selectedRole: "provider",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.exists).toBe(true);
      expect(res.body.role).toBe("provider");
    });

    test("returns exists false for new user", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
            }),
          }),
        }),
      });

      const res = await request(app)
        .post("/auth/check-user")
        .send({
          token: "google-token",
          selectedRole: "provider",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.exists).toBe(false);
    });

    test("returns 401 on invalid token", async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error("Invalid token"));

      const res = await request(app)
        .post("/auth/check-user")
        .send({
          token: "bad-token",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.exists).toBe(false);
    });
  });

  describe("POST /signup", () => {
    test("creates pending verification and sends email", async () => {
      mockSupabase.from
        // profiles lookup
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
              }),
            }),
          }),
        }))
        // pending_verifications lookup
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
              }),
            }),
          }),
        }))
        // insert pending verification
        .mockImplementationOnce(() => ({
          insert: jest.fn().mockResolvedValue({
            error: null,
          }),
        }));

      const res = await request(app)
        .post("/auth/signup")
        .send({
          token: "google-token",
          selectedRole: "provider",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockSendVerificationEmail).toHaveBeenCalled();
    });

    test("returns existing account message", async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: "profile-1" },
            }),
          }),
        }),
      }));

      const res = await request(app)
        .post("/auth/signup")
        .send({
          token: "google-token",
          selectedRole: "provider",
        });

      expect(res.body.success).toBe(false);
      expect(res.body.exists).toBe(true);
    });
  });

  describe("GET /pending-registration", () => {
    test("returns no pending registration when session missing", async () => {
      const res = await request(app).get("/auth/pending-registration");

      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /signin", () => {
    test("logs in existing user and returns JWT", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: "profile-1",
                email: "test@example.com",
                role: "provider",
                full_name: "Test User",
                isAdmin: false,
              },
            }),
          }),
        }),
      });

      const res = await request(app)
        .post("/auth/signin")
        .send({
          token: "google-token",
          selectedRole: "provider",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe("mock-jwt-token");

      expect(mockGenerateJWT).toHaveBeenCalled();
    });

    test("returns role mismatch response", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: "profile-1",
                email: "test@example.com",
                role: "applicant",
              },
            }),
          }),
        }),
      });

      const res = await request(app)
        .post("/auth/signin")
        .send({
          token: "google-token",
          selectedRole: "provider",
        });

      expect(res.body.success).toBe(false);
      expect(res.body.roleMismatch).toBe(true);
    });

    test("returns account not found response", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
            }),
          }),
        }),
      });

      const res = await request(app)
        .post("/auth/signin")
        .send({
          token: "google-token",
          selectedRole: "provider",
        });

      expect(res.body.success).toBe(false);
      expect(res.body.exists).toBe(false);
    });
  });

  describe("POST /logout", () => {
    test("destroys session and clears cookie", async () => {
      app = express();

      app.use(express.json());

      app.use((req, res, next) => {
        req.session = {
          destroy: (cb) => cb(),
        };
        next();
      });

      app.use("/auth", providerAuthRoutes);

      const res = await request(app).post("/auth/logout");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /me", () => {
    test("returns authenticated false when no session user", async () => {
      const res = await request(app).get("/auth/me");

      expect(res.body.authenticated).toBe(false);
    });

    test("returns authenticated user when session exists", async () => {
      app = express();

      app.use(express.json());

      app.use((req, res, next) => {
        req.session = {
          user: {
            id: "user-1",
            email: "test@example.com",
            role: "provider",
          },
        };
        next();
      });

      app.use("/auth", providerAuthRoutes);

      const res = await request(app).get("/auth/me");

      expect(res.body.authenticated).toBe(true);
      expect(res.body.user.email).toBe("test@example.com");
    });
  });

  describe("GET /pending-registration", () => {
    test("returns pending registration data when verified", async () => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
        req.session = {
            pendingVerificationEmail: "test@example.com",
        };
        next();
        });

        app.use("/auth", providerAuthRoutes);

        mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
                data: {
                email: "test@example.com",
                name: "Test User",
                selected_role: "provider",
                email_verified: true,
                },
                error: null,
            }),
            }),
        }),
        });

        const res = await request(app).get("/auth/pending-registration");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe("test@example.com");
    });

    test("returns failure when pending registration not verified", async () => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
        req.session = {
            pendingVerificationEmail: "test@example.com",
        };
        next();
        });

        app.use("/auth", providerAuthRoutes);

        mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
                data: {
                email_verified: false,
                },
                error: null,
            }),
            }),
        }),
        });

        const res = await request(app).get("/auth/pending-registration");

        expect(res.body.success).toBe(false);
    });
    });

    describe("POST /complete-registration", () => {
    test("completes applicant registration successfully", async () => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
        req.session = {
            pendingVerificationEmail: "test@example.com",
        };
        next();
        });

        app.use("/auth", providerAuthRoutes);

        mockSupabase.from
        // pending_verifications fetch
        .mockImplementationOnce(() => ({
            select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                data: {
                    email: "test@example.com",
                    name: "Test User",
                    picture: "avatar.png",
                    selected_role: "applicant",
                    email_verified: true,
                },
                error: null,
                }),
            }),
            }),
        }))
        // profiles insert
        .mockImplementationOnce(() => ({
            insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                data: {
                    id: "profile-1",
                },
                error: null,
                }),
            }),
            }),
        }))
        // applicant_profiles insert
        .mockImplementationOnce(() => ({
            insert: jest.fn().mockResolvedValue({
            error: null,
            }),
        }))
        // delete pending verification
        .mockImplementationOnce(() => ({
            delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({}),
            }),
        }));

        mockSupabase.auth.signUp.mockResolvedValue({
        data: {
            user: {
            id: "auth-user-1",
            },
        },
        error: null,
        });

        const res = await request(app)
        .post("/auth/complete-registration")
        .send({
            bio: "Developer",
            location: "Johannesburg",
            nqfLevel: 6,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.role).toBe("applicant");
    });

    test("completes provider registration successfully", async () => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
        req.session = {
            pendingVerificationEmail: "provider@example.com",
        };
        next();
        });

        app.use("/auth", providerAuthRoutes);

        mockSupabase.from
        // pending_verifications fetch
        .mockImplementationOnce(() => ({
            select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                data: {
                    email: "provider@example.com",
                    name: "Provider User",
                    picture: "provider.png",
                    selected_role: "provider",
                    email_verified: true,
                },
                error: null,
                }),
            }),
            }),
        }))
        // profiles insert
        .mockImplementationOnce(() => ({
            insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                data: {
                    id: "provider-profile-1",
                    role: "provider",
                },
                error: null,
                }),
            }),
            }),
        }))
        // provider_profiles insert
        .mockImplementationOnce(() => ({
            insert: jest.fn().mockResolvedValue({
            error: null,
            }),
        }))
        // delete pending verification
        .mockImplementationOnce(() => ({
            delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({}),
            }),
        }));

        mockSupabase.auth.signUp.mockResolvedValue({
        data: {
            user: {
            id: "auth-provider-1",
            },
        },
        error: null,
        });

        const res = await request(app)
        .post("/auth/complete-registration")
        .send({
            companyName: "Tech Corp",
            industry: "Technology",
            bio: "We build apps",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("returns 401 when no pending registration exists", async () => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
        req.session = {};
        next();
        });

        app.use("/auth", providerAuthRoutes);

        const res = await request(app)
        .post("/auth/complete-registration")
        .send({});

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("returns 401 when email is not verified", async () => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
        req.session = {
            pendingVerificationEmail: "test@example.com",
        };
        next();
        });

        app.use("/auth", providerAuthRoutes);

        mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
                data: {
                email_verified: false,
                },
                error: null,
            }),
            }),
        }),
        }));

        const res = await request(app)
        .post("/auth/complete-registration")
        .send({});

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("handles registration errors", async () => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
        req.session = {
            pendingVerificationEmail: "test@example.com",
        };
        next();
        });

        app.use("/auth", providerAuthRoutes);

        mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
                data: {
                email: "test@example.com",
                selected_role: "provider",
                email_verified: true,
                },
                error: null,
            }),
            }),
        }),
        }));

        mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: new Error("Auth signup failed"),
        });

        const res = await request(app)
        .post("/auth/complete-registration")
        .send({});

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });
    });
});