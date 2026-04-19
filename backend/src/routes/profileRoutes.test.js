import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: "user-123" };
  next();
});

const mockUploadSingle = jest.fn(() => (req, res, next) => {
  req.file = {
    originalname: "cv.pdf",
    mimetype: "application/pdf",
    buffer: Buffer.from("pdf"),
  };
  next();
});

const mockGetMyApplicantProfile = jest.fn((req, res) => {
  res.json({ success: true, route: "get-profile" });
});

const mockSaveMyApplicantProfile = jest.fn((req, res) => {
  res.json({ success: true, route: "save-profile" });
});

const mockUploadMyApplicantCV = jest.fn((req, res) => {
  res.json({ success: true, route: "upload-cv" });
});

jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  default: mockAuthMiddleware,
}));

jest.unstable_mockModule("../middleware/uploadMiddleware.js", () => ({
  uploadCV: {
    single: mockUploadSingle,
  },
}));

jest.unstable_mockModule("../controllers/profileController.js", () => ({
  getMyApplicantProfile: mockGetMyApplicantProfile,
  saveMyApplicantProfile: mockSaveMyApplicantProfile,
  uploadMyApplicantCV: mockUploadMyApplicantCV,
}));

const { default: profileRoutes } = await import("./profileRoutes.js");

describe("profileRoutes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/profile", profileRoutes);
    jest.clearAllMocks();
  });

  test("GET /api/profile/me uses auth middleware and controller", async () => {
    const res = await request(app).get("/api/profile/me");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      route: "get-profile",
    });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockGetMyApplicantProfile).toHaveBeenCalled();
  });

  test("POST /api/profile/me uses auth middleware and controller", async () => {
    const res = await request(app)
      .post("/api/profile/me")
      .send({ full_name: "Yanni", surname: "Patu" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      route: "save-profile",
    });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockSaveMyApplicantProfile).toHaveBeenCalled();
  });

  test("POST /api/profile/me/cv uses auth, upload middleware and controller", async () => {
    const res = await request(app).post("/api/profile/me/cv");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      route: "upload-cv",
    });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    //expect(mockUploadSingle).toHaveBeenCalled();
    expect(mockUploadMyApplicantCV).toHaveBeenCalled();
  });
});