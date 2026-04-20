import { jest } from "@jest/globals";

// Create a more flexible mock
const mockSupabase = {
  from: jest.fn(),
};

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: mockSupabase,
}));

const { applyToOpportunity } = await import("../src/services/applicationService.js");

describe("applyToOpportunity", () => {
  const userId = "user-123";
  const opportunityId = "opp-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create application with status 'applied'", async () => {
    // Create a chainable mock for each query
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
    };

    // Set up each call's response
    mockSupabase.from
      .mockReturnValueOnce(mockQuery) // profiles
      .mockReturnValueOnce(mockQuery) // applicant_profiles  
      .mockReturnValueOnce(mockQuery) // duplicate check
      .mockReturnValueOnce(mockQuery); // insert

    // Configure responses for each call
    mockQuery.single
      .mockResolvedValueOnce({ data: { id: "profile-1" }, error: null }) // profiles
      .mockResolvedValueOnce({ data: { id: "applicant-1" }, error: null }) // applicant_profiles
      .mockResolvedValueOnce({ data: null, error: null }); // duplicate check

    // Configure the insert response
    mockQuery.insert.mockReturnValue(mockQuery);
    mockQuery.select.mockReturnValue(mockQuery);
    mockQuery.single.mockResolvedValueOnce({
      data: {
        id: "app-1",
        applicant_id: "applicant-1",
        opportunity_id: opportunityId,
        status: "applied",
      },
      error: null,
    });

    const result = await applyToOpportunity({ userId, opportunityId });

    expect(result).toBeDefined();
    expect(result.status).toBe("applied");
    expect(mockSupabase.from).toHaveBeenCalledTimes(4);
    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, "profiles");
    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, "applicant_profiles");
    expect(mockSupabase.from).toHaveBeenNthCalledWith(3, "applications");
    expect(mockSupabase.from).toHaveBeenNthCalledWith(4, "applications");
  });
});