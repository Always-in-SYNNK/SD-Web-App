import { jest } from "@jest/globals";

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
    const fakeProfile = { id: "profile-1" };
    const fakeApplicantProfile = { id: "applicant-1" };
    const fakeNotifications = [{ id: "1", title: "Hello", is_read: false }];

    mockFrom
      // profiles
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeProfile,
              error: null,
            }),
          }),
        }),
      })
      // applicant_profiles
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeApplicantProfile,
              error: null,
            }),
          }),
        }),
      })
      // applicant_notifications
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: fakeNotifications,
              error: null,
            }),
          }),
        }),
      });

    const result = await getNotificationsByUserId("user-123");

    expect(result).toEqual(fakeNotifications);
  });

  test("getNotificationsByUserId throws on notifications error", async () => {
    const fakeProfile = { id: "profile-1" };
    const fakeApplicantProfile = { id: "applicant-1" };

    mockFrom
      // profiles
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeProfile,
              error: null,
            }),
          }),
        }),
      })
      // applicant_profiles
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeApplicantProfile,
              error: null,
            }),
          }),
        }),
      })
      // applicant_notifications
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: new Error("Fetch failed"),
            }),
          }),
        }),
      });

    await expect(getNotificationsByUserId("user-123")).rejects.toThrow("Fetch failed");
  });

  test("readNotification marks a notification as read", async () => {
    const fakeProfile = { id: "profile-1" };
    const fakeApplicantProfile = { id: "applicant-1" };
    const fakeNotification = { id: "n1", is_read: true };

    mockFrom
      // profiles
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeProfile,
              error: null,
            }),
          }),
        }),
      })
      // applicant_profiles
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeApplicantProfile,
              error: null,
            }),
          }),
        }),
      })
      // applicant_notifications update
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: fakeNotification,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

    const result = await readNotification("n1", "user-123");

    expect(result).toEqual(fakeNotification);
  });

  test("readNotification throws if notification not found", async () => {
    const fakeProfile = { id: "profile-1" };
    const fakeApplicantProfile = { id: "applicant-1" };

    mockFrom
      // profiles
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeProfile,
              error: null,
            }),
          }),
        }),
      })
      // applicant_profiles
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeApplicantProfile,
              error: null,
            }),
          }),
        }),
      })
      // applicant_notifications update
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
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

    mockFrom.mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: fakeNotification,
            error: null,
          }),
        }),
      }),
    });

    const result = await createNotification({
      applicantId: "applicant-1",
      type: "application_status_change",
      title: "Status updated",
      message: "Your application was shortlisted",
      applicationId: "app-1",
      opportunityId: "opp-1",
    });

    expect(result).toEqual(fakeNotification);
  });
});