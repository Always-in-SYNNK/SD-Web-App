import { applyToOpportunity } from "../services/applicationService.js";
import { supabase } from "../config/supabaseClient.js";
import { jest } from "@jest/globals";

// Mock Supabase
jest.mock("../config/supabaseClient.js", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("applyToOpportunity", () => {
  const userId = "user-123";
  const opportunityId = "opp-456";

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create application with status 'received'", async () => {
    // Mock no existing application
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    });

    // Mock insert success
    supabase.from.mockReturnValueOnce({
      insert: () => ({
        select: async () => ({
          data: [{ user_id: userId, opportunity_id: opportunityId, status: "received" }],
          error: null,
        }),
      }),
    });

    const result = await applyToOpportunity({ userId, opportunityId });

    expect(result[0].status).toBe("received");
  });

  test("should throw error if duplicate application exists", async () => {
    // Mock existing application
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({
              data: { id: "existing-app" },
              error: null,
            }),
          }),
        }),
      }),
    });

    await expect(
      applyToOpportunity({ userId, opportunityId })
    ).rejects.toThrow("Already applied to this opportunity");
  });

  test("should throw error if insert fails", async () => {
    // Mock no existing application
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    });

    // Mock insert error
    supabase.from.mockReturnValueOnce({
      insert: () => ({
        select: async () => ({
          data: null,
          error: { message: "Insert failed" },
        }),
      }),
    });

    await expect(
      applyToOpportunity({ userId, opportunityId })
    ).rejects.toThrow("Insert failed");
  });
});