import { jest } from "@jest/globals";

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockUpdate = jest.fn();
const mockInsert = jest.fn();
const mockMaybeSingle = jest.fn();
const mockSingle = jest.fn();

const mockFrom = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

const {
  getNotificationsByUserId,
  readNotification,
  createNotification,
} = await import("../src/services/notificationService.js");

describe("notificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getNotificationsByUserId returns notifications", async () => {
    const fakeNotifications = [
      { id: "1", title: "Hello", is_read: false },
    ];

    mockOrder.mockResolvedValue({
      data: fakeNotifications,
      error: null,
    });

    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const result = await getNotificationsByUserId("applicant-1");

    expect(mockFrom).toHaveBeenCalledWith("applicant_notifications");
    expect(result).toEqual(fakeNotifications);
  });

  test("getNotificationsByUserId throws on error", async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: new Error("Fetch failed"),
    });

    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    await expect(getNotificationsByUserId("applicant-1")).rejects.toThrow("Fetch failed");
  });

  test("readNotification marks a notification as read", async () => {
    const fakeNotification = { id: "n1", is_read: true };

    const secondEq = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: fakeNotification,
          error: null,
        }),
      }),
    });

    const firstEq = jest.fn().mockReturnValue({
      eq: secondEq,
    });

    mockUpdate.mockReturnValue({
      eq: firstEq,
    });

    mockFrom.mockReturnValue({
      update: mockUpdate,
    });

    const result = await readNotification("n1", "applicant-1");

    expect(mockFrom).toHaveBeenCalledWith("applicant_notifications");
    expect(result).toEqual(fakeNotification);
  });

  test("readNotification throws if notification not found", async () => {
    const secondEq = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    const firstEq = jest.fn().mockReturnValue({
      eq: secondEq,
    });

    mockUpdate.mockReturnValue({
      eq: firstEq,
    });

    mockFrom.mockReturnValue({
      update: mockUpdate,
    });

    await expect(readNotification("n1", "applicant-1")).rejects.toThrow(
      "Notification n1 not found for applicant applicant-1"
    );
  });

  test("createNotification inserts and returns notification", async () => {
    const fakeNotification = {
      id: "n1",
      applicant_id: "applicant-1",
      type: "application_status_change",
    };

    mockSingle.mockResolvedValue({
      data: fakeNotification,
      error: null,
    });

    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: mockSingle,
      }),
    });

    mockFrom.mockReturnValue({
      insert: mockInsert,
    });

    const result = await createNotification({
      applicantId: "applicant-1",
      type: "application_status_change",
      title: "Status updated",
      message: "Your application was shortlisted",
      applicationId: "app-1",
      opportunityId: "opp-1",
    });

    expect(mockFrom).toHaveBeenCalledWith("applicant_notifications");
    expect(result).toEqual(fakeNotification);
  });
});