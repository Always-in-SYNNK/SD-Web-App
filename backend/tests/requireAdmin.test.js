import { jest } from "@jest/globals";
import { requireAdmin } from "../src/middleware/requireAdmin.js";

describe("requireAdmin middleware", () => {
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

  test("returns 403 if no user is present", () => {
    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin only" });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 if user has isAdmin: false", () => {
    req.user = { isAdmin: false };

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin only" });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 if user has no isAdmin property", () => {
    req.user = { id: "user-123", role: "admin" };

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin only" });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next() if user has isAdmin: true", () => {
    req.user = { id: "user-123", isAdmin: true };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("handles user with isAdmin explicitly set to true", () => {
    req.user = { id: "admin-user", role: "admin", isAdmin: true };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
