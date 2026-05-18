import { jest } from "@jest/globals";

const mockFrom = jest.fn();
const mockSendEmailNotification = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

jest.unstable_mockModule("../src/services/emailService.js", () => ({
  sendEmailNotification: mockSendEmailNotification,
}));

const notificationService = await import("../src/services/notificationService.js");
const {
  getNotificationsByUserId,
  readNotification,
  createNotification,
  notifyApplicationStatusChange,
  triggerUpcomingClosingDateNotifications,
} = notificationService;

describe("notificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReset();
    mockSendEmailNotification.mockReset();
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
            maybeSingle: jest.fn().mockResolvedValue({
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
            maybeSingle: jest.fn().mockResolvedValue({
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

  test("createNotification sends email notification when profile and opportunity exist", async () => {
    const fakeNotification = {
      id: "n1",
      applicant_id: "applicant-1",
      type: "application_status_change",
    };

    mockFrom
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeNotification,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { profile_id: "profile-1" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: "user@example.com", full_name: "Jane Doe" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { title: "Awesome Role" },
              error: null,
            }),
          }),
        }),
      });

    mockSendEmailNotification.mockResolvedValue();

    const result = await createNotification({
      applicantId: "applicant-1",
      type: "application_status_change",
      title: "Status updated",
      message: "Your application was shortlisted",
      applicationId: "app-1",
      opportunityId: "opp-1",
    });

    expect(result).toEqual(fakeNotification);
    expect(mockSendEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        name: "Jane Doe",
        type: "application_status_change",
        title: "Status updated",
        message: "Your application was shortlisted",
        metadata: {
          application_id: "app-1",
          opportunity_id: "opp-1",
          opportunity_title: "Awesome Role",
        },
      })
    );
  });

  test("createNotification logs error but still returns data when email sending fails", async () => {
    const fakeNotification = {
      id: "n2",
      applicant_id: "applicant-1",
      type: "application_status_change",
    };

    mockFrom
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeNotification,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { profile_id: "profile-1" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: "user@example.com", full_name: "Jane Doe" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { title: "Awesome Role" },
              error: null,
            }),
          }),
        }),
      });

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockSendEmailNotification.mockRejectedValue(new Error("SMTP failed"));

    const result = await createNotification({
      applicantId: "applicant-1",
      type: "application_status_change",
      title: "Status updated",
      message: "Your application was shortlisted",
      applicationId: "app-1",
      opportunityId: "opp-1",
    });

    expect(result).toEqual(fakeNotification);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to send email notification:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test("notifyApplicationStatusChange uses provided opportunityTitle", async () => {
    const fakeNotification = {
      id: "n3",
      applicant_id: "applicant-1",
    };

    mockFrom
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeNotification,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { profile_id: "profile-1" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: "user@example.com", full_name: "Jane Doe" },
              error: null,
            }),
          }),
        }),
      });

    mockSendEmailNotification.mockResolvedValue();

    const result = await notifyApplicationStatusChange({
      applicantId: "applicant-1",
      applicationId: "app-1",
      opportunityTitle: "Awesome Role",
      newStatus: "shortlisted",
    });

    expect(result).toEqual(fakeNotification);
    expect(mockSendEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        name: "Jane Doe",
        type: "application_status_change",
        title: "You were shortlisted",
        message: 'Good news! You have been shortlisted for "Awesome Role".',
        metadata: expect.objectContaining({
          application_id: "app-1",
          opportunity_title: null,
        }),
      })
    );
  });

  test("notifyApplicationStatusChange falls back to database title when no title passed", async () => {
    const fakeNotification = {
      id: "n4",
      applicant_id: "applicant-1",
    };

    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { title: "Fallback Role" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeNotification,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { profile_id: "profile-1" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: "user@example.com", full_name: "Jane Doe" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { title: "Fallback Role" },
              error: null,
            }),
          }),
        }),
      });

    mockSendEmailNotification.mockResolvedValue();

    const result = await notifyApplicationStatusChange({
      applicantId: "applicant-1",
      applicationId: "app-1",
      opportunityId: "opp-1",
      newStatus: "shortlisted",
    });

    expect(result).toEqual(fakeNotification);
    expect(mockSendEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Good news! You have been shortlisted for "Fallback Role".',
        metadata: expect.objectContaining({
          opportunity_title: "Fallback Role",
        }),
      })
    );
  });

  test("triggerUpcomingClosingDateNotifications creates notifications for valid rows", async () => {
    const fakeNotification = { id: "notif-1" };
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({
              data: [
                {
                  id: "app-1",
                  applicant_id: "applicant-1",
                  opportunity_id: "opp-1",
                  opportunities: {
                    id: "opp-1",
                    title: "Closing Soon Role",
                    closing_date: futureDate,
                    status: "open",
                  },
                },
              ],
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: fakeNotification,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { profile_id: "profile-1" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { email: "user@example.com", full_name: "Jane Doe" },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { title: "Closing Soon Role" },
              error: null,
            }),
          }),
        }),
      });

    mockSendEmailNotification.mockResolvedValue();

    const result = await triggerUpcomingClosingDateNotifications(3);

    expect(result).toEqual([fakeNotification]);
    expect(mockSendEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        name: "Jane Doe",
        type: "upcoming_closing_date",
        title: "Opportunity closing soon",
        message: `"Closing Soon Role" is closing on ${futureDate}. Apply now!`,
      })
    );
  });
});