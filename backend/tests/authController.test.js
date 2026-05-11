import { jest } from "@jest/globals";

const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

const mockVerifyGoogleToken = jest.fn();
const mockGenerateJWT = jest.fn(() => "mock-jwt");
const mockFrom = jest.fn();
const mockListUsers = jest.fn();
const mockCreateUser = jest.fn();

jest.unstable_mockModule("../src/config/googleAuth.js", () => ({
  default: mockVerifyGoogleToken,
}));

jest.unstable_mockModule("../src/utils/generateJWT.js", () => ({
  default: mockGenerateJWT,
}));

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
    auth: {
      admin: {
        listUsers: mockListUsers,
        createUser: mockCreateUser,
      },
    },
  },
}));

const { googleAuth } = await import("../src/controllers/authController.js");

describe("googleAuth controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  test("returns 400 if no token provided", async () => {
    req.body = {};

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Google token required" });
  });

  test("returns 401 if token verification fails", async () => {
    req.body = { token: "bad-token" };
    mockVerifyGoogleToken.mockRejectedValue(new Error("invalid"));

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid Google token" });
  });

  test("returns existing user if profile exists", async () => {
    req.body = { token: "valid-token" };

    mockVerifyGoogleToken.mockResolvedValue({
      email: "test@test.com",
      name: "Test User",
    });

    const existingProfile = {
      user_id: "123",
      email: "test@test.com",
      role: "applicant",
      isAdmin: false,
    };

    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: existingProfile, error: null }),
        }),
      }),
    });

    await googleAuth(req, res);

    expect(mockGenerateJWT).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      user: existingProfile,
      token: "mock-jwt",
      isNewUser: false,
    });
  });

  test("returns 400 if new user has no selectedRole", async () => {
    req.body = { token: "valid-token" };

    mockVerifyGoogleToken.mockResolvedValue({
      email: "new@test.com",
      name: "New User",
    });

    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Role required for new users",
    });
  });

  test("creates new user successfully", async () => {
    req.body = { token: "valid-token", selectedRole: "applicant" };

    mockVerifyGoogleToken.mockResolvedValue({
      email: "new@test.com",
      name: "New User",
    });

    mockFrom.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: {
                  id: "profile-id",
                  user_id: "auth-id",
                  email: "new@test.com",
                  role: "applicant",
                  isAdmin: false,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "applicant_profiles") {
        return {
          insert: async () => ({ error: null }),
        };
      }

      return undefined;
    });

    mockListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockCreateUser.mockResolvedValue({
      data: { user: { id: "auth-id" } },
    });

    await googleAuth(req, res);

    expect(mockGenerateJWT).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "mock-jwt",
        isNewUser: true,
      })
    );
  });

  test("reuses existing auth user when creating new profile", async () => {
    req.body = { token: "valid-token", selectedRole: "applicant" };

    mockVerifyGoogleToken.mockResolvedValue({
      email: "existing-auth@test.com",
      name: "Existing Auth User",
    });

    const existingAuthUser = {
      id: "existing-auth-id",
      email: "existing-auth@test.com",
    };

    mockFrom.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: {
                  id: "new-profile-id",
                  user_id: "existing-auth-id",
                  email: "existing-auth@test.com",
                  role: "applicant",
                  isAdmin: false,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "applicant_profiles") {
        return {
          insert: async () => ({ error: null }),
        };
      }

      return undefined;
    });

    mockListUsers.mockResolvedValue({
      data: { users: [existingAuthUser] },
    });

    await googleAuth(req, res);

    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "mock-jwt",
        isNewUser: true,
      })
    );
  });

  test("returns 500 when auth user creation fails", async () => {
    req.body = { token: "valid-token", selectedRole: "applicant" };

    mockVerifyGoogleToken.mockResolvedValue({
      email: "new-auth@test.com",
      name: "New Auth User",
    });

    mockFrom.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        };
      }

      return undefined;
    });

    mockListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockCreateUser.mockResolvedValue({
      data: null,
      error: { message: "Auth user creation failed" },
    });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create auth user",
    });
  });

  test("returns 500 when profile insertion fails", async () => {
    req.body = { token: "valid-token", selectedRole: "applicant" };

    mockVerifyGoogleToken.mockResolvedValue({
      email: "profile-fail@test.com",
      name: "Profile Fail User",
    });

    mockFrom.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: null,
                error: { message: "Profile insert failed" },
              }),
            }),
          }),
        };
      }

      return undefined;
    });

    mockListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockCreateUser.mockResolvedValue({
      data: { user: { id: "auth-id" } },
    });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create profile",
    });
  });

  test("returns 500 when applicant profile insertion fails", async () => {
    req.body = { token: "valid-token", selectedRole: "applicant" };

    mockVerifyGoogleToken.mockResolvedValue({
      email: "applicant-fail@test.com",
      name: "Applicant Fail User",
    });

    mockFrom.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: {
                  id: "profile-id",
                  user_id: "auth-id",
                  email: "applicant-fail@test.com",
                  role: "applicant",
                  isAdmin: false,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "applicant_profiles") {
        return {
          insert: async () => ({ error: { message: "Applicant profile insert failed" } }),
        };
      }

      return undefined;
    });

    mockListUsers.mockResolvedValue({
      data: { users: [] },
    });

    mockCreateUser.mockResolvedValue({
      data: { user: { id: "auth-id" } },
    });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create applicant profile",
    });
  });

  test("handles unexpected error in supabase query with 500 status", async () => {
    req.body = { token: "valid-token" };

    mockVerifyGoogleToken.mockResolvedValue({
      email: "error@test.com",
      name: "Error User",
    });

    mockFrom.mockImplementation(() => {
      throw new Error("Unexpected database error");
    });

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Authentication failed",
      })
    );
  });
});