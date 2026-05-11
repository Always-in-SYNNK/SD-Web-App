import { jest } from "@jest/globals";
import requireRole from "../src/middleware/roleMiddleware.js";

describe("roleMiddleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("returns 401 if no user is present", () => {
    const middleware = requireRole("applicant");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 if user role does not match required role", () => {
    req.user = { role: "applicant" };
    const middleware = requireRole("employer");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: insufficient role",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next() if user has the required role", () => {
    req.user = { role: "applicant" };
    const middleware = requireRole("applicant");

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("requires exact role match (case-sensitive)", () => {
    req.user = { role: "Applicant" };
    const middleware = requireRole("applicant");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("works with different role types", () => {
    req.user = { role: "employer" };
    const middleware = requireRole("employer");

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
