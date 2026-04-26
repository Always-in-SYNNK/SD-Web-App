import { jest } from "@jest/globals";

//mock
const mockFrom = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

//import AFTER mock
const {
  applyToOpportunity,
  getApplicationsForUser,
  deleteApplicationForUser,
  acceptOffer
} = await import("../src/services/myApplicationService.js");


describe("myApplicationService", () => {
  const userId = "user-123";
  const profileId = "profile-123";
  const applicantId = "applicant-123";
  const applicationId = "app-456";
  const opportunityId = "opp-456";

  beforeEach(() => {
    mockFrom.mockReset();
  });

  test("should create application with status 'received'", async () => {
    // 1. profiles
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { id: "profile-1" },
            error: null,
          }),
        }),
      }),
    });

    // 2. applicant_profiles
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { id: "applicant-1" },
            error: null,
          }),
        }),
      }),
    });

    // 3. duplicate check - use maybeSingle
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }), // No existing application
          }),
        }),
      }),
    });

    // 4. insert application - with .single()
    mockFrom.mockReturnValueOnce({
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: {
              id: "app-123",
              applicant_id: "applicant-1",
              opportunity_id: opportunityId,
              status: "received",
            },
            error: null,
          }),
        }),
      }),
    });

    // 5. get opportunity title
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { title: "Software Developer Role" },
            error: null,
          }),
        }),
      }),
    });

    const result = await applyToOpportunity({ userId, opportunityId });

    expect(result).toBeDefined();
    expect(result.status).toBe("received");
  });
  // applytoOpportunities ===================================
  test("should return applications for user", async () => {
    // profiles
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: profileId } }),
        }),
      }),
    });

    // applicant_profiles
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: applicantId } }),
        }),
      }),
    });

    // applications
    const mockApps = [{ id: applicationId, status: "applied" }];

    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          order: async () => ({ data: mockApps }),
        }),
      }),
    });

    const result = await getApplicationsForUser(userId);

    expect(result).toEqual(mockApps);
  });

  test("should throw if profile not found", async () => {
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: true }),
        }),
      }),
    });

    await expect(getApplicationsForUser(userId)).rejects.toThrow("Profile not found");
  });

  // deleteApplicationForUser ===================================

  test("should delete application successfully", async () => {
    // profile
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: profileId } }),
        }),
      }),
    });

    // applicant
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: applicantId } }),
        }),
      }),
    });

    // existing application
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { id: applicationId } }),
          }),
        }),
      }),
    });

    // delete
    mockFrom.mockReturnValueOnce({
      delete: () => ({
        eq: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
    });

    await expect(
      deleteApplicationForUser({ userId, applicationId })
    ).resolves.toBeUndefined();
  });

  test("should throw if application not found", async () => {
    // profile
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: profileId } }),
        }),
      }),
    });

    // applicant
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: applicantId } }),
        }),
      }),
    });

    // no application
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null }),
          }),
        }),
      }),
    });

    await expect(
      deleteApplicationForUser({ userId, applicationId })
    ).rejects.toThrow("Application not found");
  });

  // acceptOffer ========================================

  test("should accept offer successfully", async () => {
    // profile
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: profileId } }),
        }),
      }),
    });

    // applicant
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: applicantId } }),
        }),
      }),
    });

    // application exists with offered status
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({
              data: { id: applicationId, status: "offered" },
            }),
          }),
        }),
      }),
    });

    // update
    mockFrom.mockReturnValueOnce({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({
              data: { id: applicationId, status: "accepted" },
            }),
          }),
        }),
      }),
    });

    const result = await acceptOffer({ userId, applicationId });

    expect(result.status).toBe("accepted");
  });

  test("should reject if not offered", async () => {
    // profile
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: profileId } }),
        }),
      }),
    });

    // applicant
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: applicantId } }),
        }),
      }),
    });

    // wrong status
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({
              data: { status: "applied" },
            }),
          }),
        }),
      }),
    });

    await expect(
      acceptOffer({ userId, applicationId })
    ).rejects.toThrow("Only offered applications can be accepted");
  });
});