import { jest } from "@jest/globals";

const mockGetNotificationsByUserId = jest.fn();
const mockReadNotification = jest.fn();
const mockCreateNotification = jest.fn();
const mockNotifyApplicationStatusChange = jest.fn();
const mockTriggerUpcomingClosingDateNotifications = jest.fn();

jest.unstable_mockModule("../src/services/notificationService.js", () => ({
  getNotificationsByUserId: mockGetNotificationsByUserId,
  readNotification: mockReadNotification,
  createNotification: mockCreateNotification,
  notifyApplicationStatusChange: mockNotifyApplicationStatusChange,
  triggerUpcomingClosingDateNotifications: mockTriggerUpcomingClosingDateNotifications,
}));

const {
  fetchNotifications,
  updateNotification,
  createNotificationHandler,
  triggerApplicationStatusNotification,
  triggerClosingDateNotifications,
} = await import("../src/controllers/notificationController.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("notificationController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "applicant-1" },
      params: {},
      body: {},
    };
    res = mockRes();
    next = jest.fn();

    mockGetNotificationsByUserId.mockReset();
    mockReadNotification.mockReset();
    mockCreateNotification.mockReset();
    mockNotifyApplicationStatusChange.mockReset();
    mockTriggerUpcomingClosingDateNotifications.mockReset();
  });

  test("fetchNotifications returns notifications", async () => {
    const notifications = [{ id: "n1" }];
    mockGetNotificationsByUserId.mockResolvedValueOnce(notifications);

    await fetchNotifications(req, res, next);

    expect(mockGetNotificationsByUserId).toHaveBeenCalledWith("applicant-1");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      notifications,
    });
  });

  test("updateNotification marks notification as read", async () => {
    req.params.id = "n1";
    const updated = { id: "n1", is_read: true };
    mockReadNotification.mockResolvedValueOnce(updated);

    await updateNotification(req, res, next);

    expect(mockReadNotification).toHaveBeenCalledWith("n1", "applicant-1");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      notification: updated,
    });
  });

  test("createNotificationHandler creates notification", async () => {
    req.body = {
      applicantId: "applicant-1",
      type: "application_status_change",
      title: "Updated",
      message: "Shortlisted",
      applicationId: "app-1",
      opportunityId: "opp-1",
    };

    const created = { id: "n1" };
    mockCreateNotification.mockResolvedValueOnce(created);

    await createNotificationHandler(req, res, next);

    expect(mockCreateNotification).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      notification: created,
    });
  });

  test("triggerApplicationStatusNotification triggers notification", async () => {
    req.body = {
      applicantId: "applicant-1",
      applicationId: "app-1",
      opportunityId: "opp-1",
      newStatus: "shortlisted",
    };

    const created = { id: "n1" };
    mockNotifyApplicationStatusChange.mockResolvedValueOnce(created);

    await triggerApplicationStatusNotification(req, res, next);

    expect(mockNotifyApplicationStatusChange).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      notification: created,
    });
  });

  test("triggerClosingDateNotifications triggers reminders", async () => {
    req.body = { daysAhead: 3 };
    const created = [{ id: "n1" }, { id: "n2" }];
    mockTriggerUpcomingClosingDateNotifications.mockResolvedValueOnce(created);

    await triggerClosingDateNotifications(req, res, next);

    expect(mockTriggerUpcomingClosingDateNotifications).toHaveBeenCalledWith(3);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      notifications: created,
    });
  });
});