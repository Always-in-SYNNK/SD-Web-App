import { jest } from "@jest/globals";

// Mock dependencies
const mockFrom = jest.fn();
const mockRpc = jest.fn();
const mockCreateNotification = jest.fn();
const mockSendEmailNotification = jest.fn();
const mockIsEmailConfigured = jest.fn(() => true);
const mockMatchingOpportunity = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
  },
}));

jest.unstable_mockModule("../src/services/notificationService.js", () => ({
  createNotification: mockCreateNotification,
}));

jest.unstable_mockModule("../src/services/emailService.js", () => ({
  sendEmailNotification: mockSendEmailNotification,
  isEmailConfigured: mockIsEmailConfigured,
}));

jest.unstable_mockModule("../src/services/opportunityService.js", () => ({
  matchingOpportunity: mockMatchingOpportunity,
}));

// Import after mocks
const {
  sendClosingDateReminders,
  notifyMatchingOpportunities,
} = await import("../src/services/reminderService.js");

describe("reminderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReset();
    mockRpc.mockReset();
    mockCreateNotification.mockReset();
    mockSendEmailNotification.mockReset();
    mockIsEmailConfigured.mockReset();
    mockMatchingOpportunity.mockReset();
    mockIsEmailConfigured.mockReturnValue(true);
    // Suppress console logs during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("sendClosingDateReminders", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    const oneDayLater = new Date(today);
    oneDayLater.setDate(today.getDate() + 1);

    test("sends 7-day reminders for opportunities closing in 7 days", async () => {
      const mockOpportunities = [
        {
          id: "opp-1",
          title: "Frontend Developer",
          closing_date: sevenDaysLater.toISOString(),
          applications: [
            {
              id: "app-1",
              applicant_id: "app-profile-1",
              applicant_profiles: { id: "app-profile-1" },
            },
          ],
        },
      ];

      // Mock supabase select chain
      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: mockOpportunities,
              error: null,
            }),
          }),
        }),
      }));

      // Mock duplicate check - no existing notification
      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
      }));

      // Mock applicant profile fetch for sendReminderToApplicant
      mockFrom
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { profile_id: "profile-1" },
                error: null,
              }),
            }),
          }),
        }))
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { email: "test@example.com", full_name: "Test User" },
                error: null,
              }),
            }),
          }),
        }));

      await sendClosingDateReminders();

      expect(mockCreateNotification).toHaveBeenCalledWith({
        applicantId: "app-profile-1",
        type: "7_day_reminder",
        title: "Opportunity Closing in 7 Days! ⏰",
        message: expect.stringContaining("Frontend Developer"),
        opportunityId: "opp-1",
        applicationId: "app-1",
      });

      expect(mockSendEmailNotification).toHaveBeenCalledWith({
        to: "test@example.com",
        name: "Test User",
        type: "7_day_reminder",
        title: "Opportunity Closing in 7 Days! ⏰",
        message: expect.stringContaining("Frontend Developer"),
        metadata: { opportunity_id: "opp-1", application_id: "app-1" },
      });
    });

    test("sends 24-hour reminders for opportunities closing tomorrow", async () => {
      const mockOpportunities = [
        {
          id: "opp-2",
          title: "Backend Engineer",
          closing_date: oneDayLater.toISOString(),
          applications: [
            {
              id: "app-2",
              applicant_id: "app-profile-2",
              applicant_profiles: { id: "app-profile-2" },
            },
          ],
        },
      ];

      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: mockOpportunities,
              error: null,
            }),
          }),
        }),
      }));

      // Existing notification check
      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
      }));

      // Profile and user details
      mockFrom
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { profile_id: "profile-2" },
                error: null,
              }),
            }),
          }),
        }))
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { email: "user2@example.com", full_name: "User Two" },
                error: null,
              }),
            }),
          }),
        }));

      await sendClosingDateReminders();

      expect(mockCreateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "24_hour_reminder",
          title: "Final Reminder: Closing Tomorrow! ⚠️",
        })
      );
      expect(mockSendEmailNotification).toHaveBeenCalled();
    });

    test("skips sending if notification already exists", async () => {
      const mockOpportunities = [
        {
          id: "opp-1",
          title: "Test Opp",
          closing_date: sevenDaysLater.toISOString(),
          applications: [
            {
              id: "app-1",
              applicant_id: "app-profile-1",
              applicant_profiles: { id: "app-profile-1" },
            },
          ],
        },
      ];

      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: mockOpportunities,
              error: null,
            }),
          }),
        }),
      }));

      // Existing notification found
      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: { id: "existing-id" }, error: null }),
              }),
            }),
          }),
        }),
      }));

      // No further supabase calls should be made
      await sendClosingDateReminders();

      expect(mockCreateNotification).not.toHaveBeenCalled();
      expect(mockSendEmailNotification).not.toHaveBeenCalled();
    });

    test("handles database error when fetching opportunities", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "DB error" },
            }),
          }),
        }),
      });

      await sendClosingDateReminders(); // Should not throw, just log error
      expect(console.error).toHaveBeenCalledWith("Error fetching opportunities:", expect.any(Object));
    });

    test("skips opportunities without closing date", async () => {
      const mockOpportunities = [
        {
          id: "opp-1",
          title: "No Closing Date",
          closing_date: null,
          applications: [],
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: mockOpportunities,
              error: null,
            }),
          }),
        }),
      });

      await sendClosingDateReminders();
      // No notifications should be sent because daysUntilClose is not 7 or 1
      expect(mockCreateNotification).not.toHaveBeenCalled();
    });
  });

  describe("notifyMatchingOpportunities", () => {
    const mockApplicants = [
      {
        id: "app-profile-1",
        profile_id: "profile-1",
        profiles: {
          user_id: "user-1",
          email: "applicant1@example.com",
          full_name: "John Doe",
        },
      },
      {
        id: "app-profile-2",
        profile_id: "profile-2",
        profiles: {
          user_id: "user-2",
          email: "applicant2@example.com",
          full_name: "Jane Smith",
        },
      },
    ];

    test("sends notifications for matching opportunities to each applicant", async () => {
      // Mock fetching applicants
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          data: mockApplicants,
          error: null,
        }),
      });

      // Mock matchingOpportunity responses
      const mockMatchesForUser1 = [
        { id: "opp-1", title: "React Developer", score: 0.85, skillMatchCount: 3 },
        { id: "opp-2", title: "Node.js Developer", score: 0.75, skillMatchCount: 2 },
      ];
      const mockMatchesForUser2 = [{ id: "opp-3", title: "Python Engineer", score: 0.9, skillMatchCount: 4 }];

      mockMatchingOpportunity
        .mockResolvedValueOnce(mockMatchesForUser1)
        .mockResolvedValueOnce(mockMatchesForUser2);

      // Mock duplicate notification checks (no existing)
      // Called for each opportunity: 2 for user1, 1 for user2
      mockFrom
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }))
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }))
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }));

      await notifyMatchingOpportunities();
      expect(mockMatchingOpportunity).toHaveBeenCalledTimes(2);

      // Check notifications for user1's two opportunities
      expect(mockCreateNotification).toHaveBeenCalledTimes(3);
      expect(mockCreateNotification).toHaveBeenCalledWith({
        applicantId: "app-profile-1",
        type: "matching_opportunity",
        title: "New Matching Opportunity Found! 🎯",
        message: expect.stringContaining("React Developer"),
        opportunityId: "opp-1",
      });
      expect(mockCreateNotification).toHaveBeenCalledWith({
        applicantId: "app-profile-1",
        type: "matching_opportunity",
        title: "New Matching Opportunity Found! 🎯",
        message: expect.stringContaining("Node.js Developer"),
        opportunityId: "opp-2",
      });
      expect(mockCreateNotification).toHaveBeenCalledWith({
        applicantId: "app-profile-2",
        type: "matching_opportunity",
        title: "New Matching Opportunity Found! 🎯",
        message: expect.stringContaining("Python Engineer"),
        opportunityId: "opp-3",
      });

      // Check emails
      expect(mockSendEmailNotification).toHaveBeenCalledTimes(3);
      expect(mockSendEmailNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "applicant1@example.com",
          name: "John Doe",
          type: "matching_opportunity",
          metadata: expect.objectContaining({
            opportunity_id: "opp-1",
            score: 0.85,
            skill_match_count: 3,
          }),
        })
      );
    });

    test("skips duplicate notifications for already notified opportunities", async () => {
      const mockApplicants = [
        {
          id: "app-profile-1",
          profile_id: "profile-1",
          profiles: { user_id: "user-1", email: "test@example.com", full_name: "Test" },
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockApplicants,
          error: null,
        }),
      });

      mockMatchingOpportunity.mockResolvedValueOnce([{ id: "opp-1", title: "Existing Opp", score: 0.5, skillMatchCount: 1 }]);

      // Duplicate check returns existing notification
      mockFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: { id: "existing" }, error: null }),
              }),
            }),
          }),
        }),
      }));

      await notifyMatchingOpportunities();

      expect(mockCreateNotification).not.toHaveBeenCalled();
      expect(mockSendEmailNotification).not.toHaveBeenCalled();
    });

    test("handles error when fetching applicants", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Fetch error" },
        }),
      });

      await notifyMatchingOpportunities();
      expect(console.error).toHaveBeenCalledWith("Error fetching applicants:", expect.any(Object));
      expect(mockCreateNotification).not.toHaveBeenCalled();
    });

    test("handles matchingOpportunity throwing error for an applicant", async () => {
      const mockApplicants = [
        {
          id: "app-profile-1",
          profile_id: "profile-1",
          profiles: { user_id: "user-1", email: "a@a.com", full_name: "A" },
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockApplicants,
          error: null,
        }),
      });

      mockMatchingOpportunity.mockRejectedValueOnce(new Error("Matching failed"));

      await notifyMatchingOpportunities();
      expect(console.error).toHaveBeenCalledWith("Error processing applicant app-profile-1:", expect.any(Error));
      expect(mockCreateNotification).not.toHaveBeenCalled();
    });

    test("does nothing when no applicants found", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      await notifyMatchingOpportunities();
      expect(mockMatchingOpportunity).not.toHaveBeenCalled();
      expect(mockCreateNotification).not.toHaveBeenCalled();
    });

    test("skips applicant if missing user_id", async () => {
      const mockApplicants = [
        {
          id: "app-profile-1",
          profile_id: "profile-1",
          profiles: { user_id: null, email: "no-user@example.com" }, // missing user_id
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockApplicants,
          error: null,
        }),
      });

      await notifyMatchingOpportunities();
      expect(mockMatchingOpportunity).not.toHaveBeenCalled();
    });
  });
});