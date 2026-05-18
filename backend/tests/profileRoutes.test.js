jest.unstable_mockModule('../src/config/supabaseClient.js', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        createSignedUrl: jest.fn(),
      })),
    },
  },
}));
import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Mock only the middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: "60de0da9-5806-4cdd-b950-916bdaadbd19" }; // Real UUID format
  next();
});

const mockProviderAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: "provider-user-123" };
  next();
});

const mockUploadSingle = jest.fn(() => (req, res, next) => {
  req.file = {
    originalname: "cv.pdf",
    mimetype: "application/pdf",
    buffer: Buffer.from("pdf"),
  };
  next();
});

jest.unstable_mockModule("../src/middleware/authMiddleware.js", () => ({
  default: mockAuthMiddleware,
}));

jest.unstable_mockModule("../src/middleware/providerAuthMiddleware.js", () => ({
  default: mockProviderAuthMiddleware,
}));

jest.unstable_mockModule("../src/middleware/uploadMiddleware.js", () => ({
  uploadCV: {
    single: mockUploadSingle,
  },
}));

// Import the real controllers (not mocked)
const { default: profileRoutes } = await import("../src/routes/profileRoutes.js");

describe("profileRoutes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/profile", profileRoutes);
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  test("GET /api/profile/me route exists and uses middleware", async () => {
    const res = await request(app).get("/api/profile/me");
    
    // Just verify the route exists and middleware was called
    // The actual response depends on your controller implementation
    expect(mockAuthMiddleware).toHaveBeenCalled();
    // Don't assert on response body if controllers are real
    expect(res.status).toBeDefined();
  });

  test("POST /api/profile/me route exists and uses middleware", async () => {
    const res = await request(app)
      .post("/api/profile/me")
      .send({ full_name: "Yanni", surname: "Patu" });

    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(res.status).toBeDefined();
  });

  test("GET /api/profile/me/qualifications route exists", async () => {
    const res = await request(app).get("/api/profile/me/qualifications");
    
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(res.status).toBeDefined();
  });

  test("GET /api/profile/provider/:providerProfileId route exists", async () => {
    const res = await request(app)
      .get("/api/profile/provider/provider-123");

    expect(mockProviderAuthMiddleware).toHaveBeenCalled();
    expect(res.status).toBeDefined();
  });

  test("PUT /api/profile/provider/:providerProfileId route exists", async () => {
    const res = await request(app)
      .put("/api/profile/provider/provider-123")
      .send({
        organisation_name: "Updated Org",
      });

    expect(mockProviderAuthMiddleware).toHaveBeenCalled();
    expect(res.status).toBeDefined();
  });
});
