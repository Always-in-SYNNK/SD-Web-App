import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

jest.unstable_mockModule("../src/middleware/requireAuth.js", () => ({
  requireAuth: (req, res, next) => {
    req.user = { profileId: "123", isAdmin: true };
    next();
  },
}));

jest.unstable_mockModule("../src/middleware/requireAdmin.js", () => ({
  requireAdmin: (req, res, next) => next(),
}));

jest.unstable_mockModule("../src/controllers/adminController.js", () => ({
  applyForAdmin: (req, res) => res.json({ ok: true }),
  getMyAdminApplicationStatus: (req, res) => res.json({ ok: true }),
  getAdminApplications: (req, res) => res.json([]),
  approveApplication: (req, res) => res.json({ ok: true }),
  rejectApplication: (req, res) => res.json({ ok: true }),
}));

const adminRoutes = (await import("../src/routes/adminRoutes.js")).default;

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("adminRoutes", () => {
  test("POST /apply", async () => {
    const res = await request(app).post("/api/admin/apply");
    expect(res.statusCode).toBe(200);
  });

  test("GET /applications", async () => {
    const res = await request(app).get("/api/admin/applications");
    expect(res.statusCode).toBe(200);
  });

  test("PATCH approve", async () => {
    const res = await request(app).patch("/api/admin/123/approve");
    expect(res.statusCode).toBe(200);
  });

  test("PATCH reject", async () => {
    const res = await request(app).patch("/api/admin/123/reject");
    expect(res.statusCode).toBe(200);
  });
});