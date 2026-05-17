// backend/tests/analyticsRoutes.test.js
import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

// Mock controllers
const mockControllers = {
  getApplicationAnalytics: jest.fn((req, res) =>
    res.status(200).json({ success: true })
  ),
  getAdminApplicationAnalytics: jest.fn((req, res) =>
    res.status(200).json({ success: true })
  ),
  getTrendAnalytics: jest.fn((req, res) =>
    res.status(200).json({ success: true })
  ),
  exportAnalytics: jest.fn((req, res) =>
    res.status(200).json({ success: true })
  ),
  getPlacementRates: jest.fn((req, res) =>
    res.status(200).json({ success: true })
  ),
  getProviderPlacementRates: jest.fn((req, res) =>
    res.status(200).json({ success: true })
  ),
};

jest.unstable_mockModule(
  "../src/controllers/analyticsController.js",
  () => mockControllers
);

// Mock middleware
const providerAuthMiddleware = jest.fn((req, res, next) => next());
const requireAuth = jest.fn((req, res, next) => next());
const requireAdmin = jest.fn((req, res, next) => next());

jest.unstable_mockModule(
  "../src/middleware/providerAuthMiddleware.js",
  () => ({
    default: providerAuthMiddleware,
  })
);

jest.unstable_mockModule(
  "../src/middleware/authMiddleware.js",
  () => ({
    default: jest.fn((req, res, next) => next()),
  })
);

jest.unstable_mockModule(
  "../src/middleware/requireAuth.js",
  () => ({
    requireAuth,
  })
);

jest.unstable_mockModule(
  "../src/middleware/requireAdmin.js",
  () => ({
    requireAdmin,
  })
);

// Import router AFTER mocks
const analyticsRoutes = (
  await import("../src/routes/analyticsRoutes.js")
).default;

describe("analyticsRoutes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/analytics", analyticsRoutes);
  });

  test("GET /test returns success response", async () => {
    const res = await request(app).get("/analytics/test");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Test route works!");
  });

  test("GET /ping returns pong response", async () => {
    const res = await request(app).get("/analytics/ping");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("pong");
  });

  test("GET /applications uses provider auth and calls controller", async () => {
    await request(app).get("/analytics/applications");

    expect(providerAuthMiddleware).toHaveBeenCalled();
    expect(mockControllers.getApplicationAnalytics).toHaveBeenCalled();
  });

  test("GET /trends uses provider auth and calls controller", async () => {
    await request(app).get("/analytics/trends");

    expect(providerAuthMiddleware).toHaveBeenCalled();
    expect(mockControllers.getTrendAnalytics).toHaveBeenCalled();
  });

  test("GET /export uses provider auth and calls controller", async () => {
    await request(app).get("/analytics/export");

    expect(providerAuthMiddleware).toHaveBeenCalled();
    expect(mockControllers.exportAnalytics).toHaveBeenCalled();
  });

  test("GET /provider-placements uses provider auth and calls controller", async () => {
    await request(app).get("/analytics/provider-placements");

    expect(providerAuthMiddleware).toHaveBeenCalled();
    expect(mockControllers.getProviderPlacementRates).toHaveBeenCalled();
  });

  test("GET /admin/applications uses admin middleware and calls controller", async () => {
    await request(app).get("/analytics/admin/applications");

    expect(requireAuth).toHaveBeenCalled();
    expect(requireAdmin).toHaveBeenCalled();
    expect(mockControllers.getAdminApplicationAnalytics).toHaveBeenCalled();
  });

  test("GET /placements uses admin middleware and calls controller", async () => {
    await request(app).get("/analytics/placements");

    expect(requireAuth).toHaveBeenCalled();
    expect(requireAdmin).toHaveBeenCalled();
    expect(mockControllers.getPlacementRates).toHaveBeenCalled();
  });
});