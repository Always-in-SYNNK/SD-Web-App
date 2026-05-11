import { jest } from "@jest/globals";

const mockVerify = jest.fn();

const mockFrom = jest.fn((table) => {
  if (table === "profiles") {
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { id: "profile-1", user_id: "user-1", email: "prov@test.com", role: "provider" },
            error: null,
          }),
          maybeSingle: async () => ({
            data: { id: "profile-1", user_id: "user-1", email: "prov@test.com", role: "provider" },
            error: null,
          }),
        }),
      }),
    };
  }

  if (table === "provider_profiles") {
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { id: "provider-profile-1" },
            error: null,
          }),
          maybeSingle: async () => ({
            data: { id: "provider-profile-1" },
            error: null,
          }),
        }),
      }),
    };
  }

  return {
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
      }),
    }),
  };
});

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockVerify,
  },
}));

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

const { default: providerAuthMiddleware } = await import("../src/middleware/providerAuthMiddleware.js");

describe("providerAuthMiddleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {}, session: null, path: "/api/employer/applications" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  test("falls back to session auth when bearer token is invalid", async () => {
    req.headers.authorization = "Bearer invalid-token";
    req.session = {
      user: { email: "prov@test.com", role: "provider" },
    };

    mockVerify.mockImplementation(() => {
      throw Object.assign(new Error("invalid token"), { name: "JsonWebTokenError" });
    });

    await providerAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      id: "profile-1",
      email: "prov@test.com",
      role: "provider",
      profileId: "provider-profile-1",
    });
  });

  test("uses jwt auth when token is valid", async () => {
    req.headers.authorization = "Bearer valid-token";
    mockVerify.mockReturnValue({ id: "user-1", email: "prov@test.com", role: "provider" });

    await providerAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.profileId).toBe("provider-profile-1");
  });

  test("returns 401 when neither token nor session exists", async () => {
    await providerAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided. Please log in." });
    expect(next).not.toHaveBeenCalled();
  });
});