import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: "user-1" };
  next();
});

const mockGetSkills = jest.fn((req, res) => {
  res.json({ success: true, route: "get-skills", params: req.params });
});

const mockGetApplicant = jest.fn((req, res) => {
  res.json({ success: true, route: "get-applicant", params: req.params });
});

const mockGetOppSkills = jest.fn((req, res) => {
  res.json({ success: true, route: "get-opportunity-skills", params: req.params });
});

const mockSetAppSkills = jest.fn((req, res) => {
  res.json({ success: true, route: "set-app-skills", body: req.body });
});

const mockSetOppSkills = jest.fn((req, res) => {
  res.json({ success: true, route: "set-opportunity-skills", params: req.params, body: req.body });
});

jest.unstable_mockModule("../src/middleware/authMiddleware.js", () => ({
  default: mockAuthMiddleware,
}));

jest.unstable_mockModule("../src/controllers/skillsController.js", () => ({
  getSkills: mockGetSkills,
  getApplicant: mockGetApplicant,
  getOppSkills: mockGetOppSkills,
  setAppSkills: mockSetAppSkills,
  setOppSkills: mockSetOppSkills,
}));

const { default: skillsRoutes } = await import("../src/routes/skillsRoutes.js");

describe("skillsRoutes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/skills", skillsRoutes);
    jest.clearAllMocks();
  });

  test("GET /api/skills/field/:fieldName routes to getSkills", async () => {
    const res = await request(app).get("/api/skills/field/IT");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, route: "get-skills", params: { fieldName: "IT" } });
    expect(mockGetSkills).toHaveBeenCalled();
  });

  test("GET /api/skills/applicant/:applicantId routes to getApplicant", async () => {
    const res = await request(app).get("/api/skills/applicant/123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, route: "get-applicant", params: { applicantId: "123" } });
    expect(mockGetApplicant).toHaveBeenCalled();
  });

  test("GET /api/skills/opportunity/:opportunityId routes to getOppSkills", async () => {
    const res = await request(app).get("/api/skills/opportunity/321");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, route: "get-opportunity-skills", params: { opportunityId: "321" } });
    expect(mockGetOppSkills).toHaveBeenCalled();
  });

  test("PUT /api/skills/applicant/me uses auth middleware and setAppSkills", async () => {
    const payload = { skills: [1, 2, 3] };
    const res = await request(app).put("/api/skills/applicant/me").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, route: "set-app-skills", body: payload });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockSetAppSkills).toHaveBeenCalled();
  });

  test("PUT /api/skills/opportunity/:opportunityId uses auth middleware and setOppSkills", async () => {
    const payload = { skills: [4, 5] };
    const res = await request(app).put("/api/skills/opportunity/321").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, route: "set-opportunity-skills", params: { opportunityId: "321" }, body: payload });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockSetOppSkills).toHaveBeenCalled();
  });
});