import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

describe("myApplicationRoutes", () => {
  let app;
  let mockApply;
  let mockGetMyApplications;
  let mockAccept;
  let mockUnapply;
  let mockAuthMiddleware;

  beforeEach(async () => {
    jest.resetModules();

    mockApply = jest.fn((req, res) => {
      res.status(201).json({ ok: true });
    });
    mockGetMyApplications = jest.fn((req, res) => {
      res.status(200).json({ ok: true });
    });
    mockAccept = jest.fn((req, res) => {
      res.status(200).json({ ok: true });
    });
    mockUnapply = jest.fn((req, res) => {
      res.status(200).json({ ok: true });
    });

    mockAuthMiddleware = jest.fn((req, res, next) => {
      req.user = { id: "user-123" };
      next();
    });

    jest.unstable_mockModule("../src/controllers/myApplicationController.js", () => ({
      apply: mockApply,
      getMyApplications: mockGetMyApplications,
      accept: mockAccept,
      unapply: mockUnapply,
    }));

    jest.unstable_mockModule("../src/middleware/authMiddleware.js", () => ({
      default: mockAuthMiddleware,
    }));

    const router = (await import("../src/routes/myApplicationRoutes.js")).default;

    app = express();
    app.use(express.json());
    app.use("/applications", router);
  });

  test("POST /applications should run auth middleware and apply controller", async () => {
    const res = await request(app).post("/applications").send({ opportunityId: "opp-1" });

    expect(res.statusCode).toBe(201);
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockApply).toHaveBeenCalled();
  });

  test("GET /applications/my should run auth middleware and getMyApplications controller", async () => {
    const res = await request(app).get("/applications/my");

    expect(res.statusCode).toBe(200);
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockGetMyApplications).toHaveBeenCalled();
  });

  test("POST /applications/accept should run auth middleware and accept controller", async () => {
    const res = await request(app).post("/applications/accept").send({ applicationId: "app-1" });

    expect(res.statusCode).toBe(200);
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockAccept).toHaveBeenCalled();
  });

  test("DELETE /applications/:id should run auth middleware and unapply controller", async () => {
    const res = await request(app).delete("/applications/app-1");

    expect(res.statusCode).toBe(200);
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockUnapply).toHaveBeenCalled();
  });
});