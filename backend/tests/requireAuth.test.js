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

  test("fails with no token", async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("passes with valid token", async () => {
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
              isAdmin: true,
            },
          }),
        }),
      }),
    });

    const req = {
      headers: { authorization: "Bearer token" },
    };

    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});