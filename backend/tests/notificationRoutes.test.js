import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: "applicant-1" };
  next();
});

const mockFetchNotifications = jest.fn((req, res) => {
  res.json({ success: true, route: "fetch-notifications" });
});

const mockUpdateNotification = jest.fn((req, res) => {
  res.json({ success: true, route: "update-notification" });
});

const mockCreateNotificationHandler = jest.fn((req, res) => {
  res.status(201).json({ success: true, route: "create-notification" });
});

const mockTriggerApplicationStatusNotification = jest.fn((req, res) => {
  res.status(201).json({ success: true, route: "trigger-status" });
});

const mockTriggerClosingDateNotifications = jest.fn((req, res) => {
  res.status(201).json({ success: true, route: "trigger-closing" });
});

jest.unstable_mockModule("../src/middleware/authMiddleware.js", () => ({
  default: mockAuthMiddleware,
}));

jest.unstable_mockModule("../src/controllers/notificationController.js", () => ({
  fetchNotifications: mockFetchNotifications,
  updateNotification: mockUpdateNotification,
  createNotificationHandler: mockCreateNotificationHandler,
  triggerApplicationStatusNotification: mockTriggerApplicationStatusNotification,
  triggerClosingDateNotifications: mockTriggerClosingDateNotifications,
}));

const { default: notificationRoutes } = await import("../src/routes/notificationRoutes.js");

describe("notificationRoutes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/notifications", notificationRoutes);
    jest.clearAllMocks();
  });

  test("GET /api/notifications uses auth and fetch controller", async () => {
    const res = await request(app).get("/api/notifications");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      route: "fetch-notifications",
    });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockFetchNotifications).toHaveBeenCalled();
  });

  test("PATCH /api/notifications/:id uses auth and update controller", async () => {
    const res = await request(app).patch("/api/notifications/n1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      route: "update-notification",
    });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockUpdateNotification).toHaveBeenCalled();
  });

  test("POST /api/notifications uses auth and create controller", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({ title: "Hello" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      route: "create-notification",
    });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockCreateNotificationHandler).toHaveBeenCalled();
  });

  test("POST /api/notifications/trigger/application-status uses auth and trigger controller", async () => {
    const res = await request(app)
      .post("/api/notifications/trigger/application-status")
      .send({ newStatus: "shortlisted" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      route: "trigger-status",
    });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockTriggerApplicationStatusNotification).toHaveBeenCalled();
  });

  test("POST /api/notifications/trigger/closing-soon uses auth and closing trigger controller", async () => {
    const res = await request(app)
      .post("/api/notifications/trigger/closing-soon")
      .send({ daysAhead: 3 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      route: "trigger-closing",
    });
    expect(mockAuthMiddleware).toHaveBeenCalled();
    expect(mockTriggerClosingDateNotifications).toHaveBeenCalled();
  });
});