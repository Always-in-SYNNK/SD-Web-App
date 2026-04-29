import { jest } from "@jest/globals";

const mockVerify = jest.fn();
const mockJwt = { verify: mockVerify };

const mockFrom = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: mockJwt,
}));
jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

const { requireAuth } = await import("../src/middleware/requireAuth.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn();
  return res;
};

describe("requireAuth", () => {
  afterEach(() => jest.clearAllMocks());

  test("fails with no token or session", async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "No token or session provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("fails with invalid token (jwt.verify throws)", async () => {
    mockVerify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const req = {
      headers: { authorization: "Bearer invalid-token" },
    };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired authentication",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("fails when token is valid but profile not found by user_id", async () => {
    mockVerify.mockReturnValue({ id: "user-not-found" });

    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
          }),
        }),
      }),
    });

    const req = {
      headers: { authorization: "Bearer valid-token" },
    };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Profile not found" });
    expect(next).not.toHaveBeenCalled();
  });

  test("passes with valid token and profile found by user_id", async () => {
    mockVerify.mockReturnValue({ id: "user123" });

    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              id: "profile1",
              user_id: "user123",
              email: "test@test.com",
              role: "applicant",
              isAdmin: false,
            },
          }),
        }),
      }),
    });

    const req = {
      headers: { authorization: "Bearer valid-token" },
    };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe("user123");
    expect(req.user.email).toBe("test@test.com");
    expect(req.user.role).toBe("applicant");
    expect(req.user.isAdmin).toBe(false);
    expect(next).toHaveBeenCalled();
  });

  test("passes with session user and profile found", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              id: "profile2",
              user_id: "session-user-id",
              email: "session@test.com",
              role: "employer",
              isAdmin: true,
            },
          }),
        }),
      }),
    });

    const req = {
      headers: {},
      session: {
        user: {
          email: "session@test.com",
        },
      },
    };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe("session-user-id");
    expect(req.user.email).toBe("session@test.com");
    expect(req.user.role).toBe("employer");
    expect(req.user.isAdmin).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  test("fails when session user is present but profile not found", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
          }),
        }),
      }),
    });

    const req = {
      headers: {},
      session: {
        user: {
          email: "notindb@test.com",
        },
      },
    };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Profile not found" });
    expect(next).not.toHaveBeenCalled();
  });

  test("handles token with isAdmin set to false", async () => {
    mockVerify.mockReturnValue({ id: "user-non-admin" });

    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              id: "profile3",
              user_id: "user-non-admin",
              email: "nonadmin@test.com",
              role: "applicant",
              isAdmin: false,
            },
          }),
        }),
      }),
    });

    const req = {
      headers: { authorization: "Bearer valid-token" },
    };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(req.user.isAdmin).toBe(false);
    expect(next).toHaveBeenCalled();
  });

  test("handles bearer token without space after Bearer", async () => {
    const req = {
      headers: { authorization: "Bearertoken" },
    };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});