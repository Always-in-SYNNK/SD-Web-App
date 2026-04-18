import { jest } from "@jest/globals";

// ✅ mock
const mockFrom = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

// ✅ import AFTER mock
const { applyToOpportunity } = await import("../src/services/applicationService.js");

describe("applyToOpportunity", () => {
  const userId = "user-123";
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

    // 3. applications (duplicate check)
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    });

    // 4. applications (insert)
    mockFrom.mockReturnValueOnce({
      insert: () => ({
        select: async () => ({
          data: [
            {
              applicant_id: "applicant-1",
              opportunity_id: opportunityId,
              status: "applied",
            },
          ],
          error: null,
        }),
      }),
    });

    const result = await applyToOpportunity({ userId, opportunityId });

    expect(result).toBeDefined();
  });
});