import { jest } from "@jest/globals";

const mockVerify = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockVerify,
  },
}));

const { default: authMiddleware } = await import("../src/middleware/authMiddleware.js");

describe("authMiddleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("returns 401 if no auth header", () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
  });

  test("returns 401 if token invalid", () => {
    req.headers.authorization = "Bearer invalid";
    mockVerify.mockImplementation(() => {
      throw new Error();
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("calls next if token valid", () => {
    req.headers.authorization = "Bearer valid";

    mockVerify.mockReturnValue({
      id: "123",
      email: "test@test.com",
      role: "applicant",
    });

    authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});