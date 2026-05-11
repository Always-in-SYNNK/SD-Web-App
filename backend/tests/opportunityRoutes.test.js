import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

// Mock controllers
const mockControllers = {
  fetchLocations: jest.fn((req, res) => res.sendStatus(200)),
  fetchFields: jest.fn((req, res) => res.sendStatus(200)),
  fetchNqfLevels: jest.fn((req, res) => res.sendStatus(200)),
  fetchOpportunities: jest.fn((req, res) => res.sendStatus(200)),
  publishOpportunity: jest.fn((req, res) => res.sendStatus(200)),
  updateOpportunity: jest.fn((req, res) => res.sendStatus(200)),
  getOpportunity: jest.fn((req, res) => res.sendStatus(200)),
  saveDraft: jest.fn((req, res) => res.sendStatus(200)),
  getPendingOpportunities: jest.fn((req, res) => res.sendStatus(200)),
  getApprovedOpportunities: jest.fn((req, res) => res.sendStatus(200)),
  approveOpportunity: jest.fn((req, res) => res.sendStatus(200)),
  rejectOpportunity: jest.fn((req, res) => res.sendStatus(200)),
  deleteOpportunity: jest.fn((req, res) => res.sendStatus(200)),
  getMatchingOpportunities: jest.fn((req, res) => res.sendStatus(200)),
};

jest.unstable_mockModule(
  "../src/controllers/opportunityController.js",
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

jest.unstable_mockModule(
  "../src/middleware/authMiddleware.js",
  () => ({
    default: jest.fn((req, res, next) => next()),
  })
);

// Import AFTER mocks
const router = (await import("../src/routes/opportunityRoutes.js")).default;

describe("opportunityRoutes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/opportunities", router);
  });

  test("GET /filters/locations calls fetchLocations", async () => {
    await request(app).get("/opportunities/filters/locations");

    expect(mockControllers.fetchLocations).toHaveBeenCalled();
  });

  test("GET /filters/fields calls fetchFields", async () => {
    await request(app).get("/opportunities/filters/fields");

    expect(mockControllers.fetchFields).toHaveBeenCalled();
  });

  test("GET /filters/nqf-levels calls fetchNqfLevels", async () => {
    await request(app).get("/opportunities/filters/nqf-levels");

    expect(mockControllers.fetchNqfLevels).toHaveBeenCalled();
  });

  test("GET / calls fetchOpportunities", async () => {
    await request(app).get("/opportunities");

    expect(mockControllers.fetchOpportunities).toHaveBeenCalled();
  });

  test("GET /matches uses auth and calls getMatchingOpportunities", async () => {
    await request(app).get("/opportunities/matches");

    expect(requireAuth).toHaveBeenCalled();
    expect(mockControllers.getMatchingOpportunities).toHaveBeenCalled();
  });

  test("POST /publish uses provider auth and calls publishOpportunity", async () => {
    await request(app).post("/opportunities/publish");

    expect(providerAuthMiddleware).toHaveBeenCalled();
    expect(mockControllers.publishOpportunity).toHaveBeenCalled();
  });

  test("POST /draft uses provider auth and calls saveDraft", async () => {
    await request(app).post("/opportunities/draft");

    expect(providerAuthMiddleware).toHaveBeenCalled();
    expect(mockControllers.saveDraft).toHaveBeenCalled();
  });

  test("GET /pending uses admin middleware and calls getPendingOpportunities", async () => {
    await request(app).get("/opportunities/pending");

    expect(requireAuth).toHaveBeenCalled();
    expect(requireAdmin).toHaveBeenCalled();
    expect(mockControllers.getPendingOpportunities).toHaveBeenCalled();
  });

  test("GET /approved uses admin middleware and calls getApprovedOpportunities", async () => {
    await request(app).get("/opportunities/approved");

    expect(requireAuth).toHaveBeenCalled();
    expect(requireAdmin).toHaveBeenCalled();
    expect(mockControllers.getApprovedOpportunities).toHaveBeenCalled();
  });

  test("PATCH /:id uses provider auth and calls updateOpportunity", async () => {
    await request(app).patch("/opportunities/123");

    expect(providerAuthMiddleware).toHaveBeenCalled();
    expect(mockControllers.updateOpportunity).toHaveBeenCalled();
  });

  test("GET /:id uses provider auth and calls getOpportunity", async () => {
    await request(app).get("/opportunities/123");

    expect(providerAuthMiddleware).toHaveBeenCalled();
    expect(mockControllers.getOpportunity).toHaveBeenCalled();
  });

  test("PATCH /:id/approve uses admin middleware and calls approveOpportunity", async () => {
    await request(app).patch("/opportunities/123/approve");

    expect(requireAuth).toHaveBeenCalled();
    expect(requireAdmin).toHaveBeenCalled();
    expect(mockControllers.approveOpportunity).toHaveBeenCalled();
  });

  test("PATCH /:id/reject uses admin middleware and calls rejectOpportunity", async () => {
    await request(app).patch("/opportunities/123/reject");

    expect(requireAuth).toHaveBeenCalled();
    expect(requireAdmin).toHaveBeenCalled();
    expect(mockControllers.rejectOpportunity).toHaveBeenCalled();
  });

  test("DELETE /:id uses admin middleware and calls deleteOpportunity", async () => {
    await request(app).delete("/opportunities/123");

    expect(requireAuth).toHaveBeenCalled();
    expect(requireAdmin).toHaveBeenCalled();
    expect(mockControllers.deleteOpportunity).toHaveBeenCalled();
  });
});