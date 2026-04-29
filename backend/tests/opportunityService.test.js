import { jest } from '@jest/globals';

const mockRpc = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockOr = jest.fn();
const mockIlike = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockRange = jest.fn();

// Setup chain
mockRange.mockReturnValue({ data: [], error: null, count: 0 });
mockOrder.mockReturnValue({ range: mockRange });
mockEq.mockReturnValue({ order: mockOrder });
mockIlike.mockReturnValue({ eq: mockEq });
mockOr.mockReturnValue({ ilike: mockIlike });
mockSelect.mockReturnValue({ or: mockOr });
mockFrom.mockReturnValue({ select: mockSelect });

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

const {
  getDistinctLocations,
  getDistinctFields,
  getDistinctNqfLevels,
  getFilteredOpportunitiesAndQualifications,
  createOpportunity,
  updateOpportunityForProvider,
  getOpportunityForProvider,
  getPending,
  getApproved,
  updateStatus,
  deleteOpportunityById,
} = await import("../src/services/opportunityService.js");

describe("opportunityService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Distinct value functions", () => {
    test("getDistinctLocations returns normalized values", async () => {
      mockRpc.mockResolvedValue({
        data: [{ location: "Gauteng" }, { location: "Western Cape" }],
        error: null,
      });

      const result = await getDistinctLocations();
      expect(result).toEqual(["Gauteng", "Western Cape"]);
    });

    test("getDistinctLocations handles string array", async () => {
      mockRpc.mockResolvedValue({ data: ["Gauteng", "Western Cape"], error: null });
      const result = await getDistinctLocations();
      expect(result).toEqual(["Gauteng", "Western Cape"]);
    });

    test("getDistinctFields throws when RPC fails", async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: "RPC failed" } });
      await expect(getDistinctFields()).rejects.toThrow("RPC failed");
    });

    test("getDistinctNqfLevels handles number array", async () => {
      mockRpc.mockResolvedValue({ data: [5, 6, 7], error: null });
      const result = await getDistinctNqfLevels();
      expect(result).toEqual(["5", "6", "7"]);
    });

    test("getDistinctNqfLevels handles object array", async () => {
      mockRpc.mockResolvedValue({ data: [{ nqf_level: 5 }, { nqf_level: 6 }], error: null });
      const result = await getDistinctNqfLevels();
      expect(result).toEqual(["5", "6"]);
    });

    test("handles empty data gracefully", async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      const result = await getDistinctLocations();
      expect(result).toEqual([]);
    });
  });

  describe("getFilteredOpportunitiesAndQualifications", () => {
    const mockOpportunities = [
      { id: 1, title: "Software Dev", location: "Gauteng", nqf_level: 7, field: "IT", created_at: "2024-01-01" },
      { id: 2, title: "Data Scientist", location: "Western Cape", nqf_level: 8, field: "IT", created_at: "2024-01-02" },
    ];
    const mockQualifications = [
      { id: 1, qualification_name: "BSc CS", nqf_level: 7, field: "IT" },
    ];

    // Create chainable mock objects
    let mockQueryBuilder;

    beforeEach(() => {
      // Create a fresh mock chain for each test
      mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnValue({ data: mockOpportunities, error: null, count: 2 }),
      };

      mockFrom.mockReturnValue(mockQueryBuilder);
      mockRpc.mockResolvedValue({ data: mockQualifications, error: null });
    });

    test("returns combined opportunities and qualifications", async () => {
      const result = await getFilteredOpportunitiesAndQualifications();

      expect(mockFrom).toHaveBeenCalledWith("opportunities");
      expect(result.data).toHaveLength(3);
      expect(result.summary.opportunities).toBe(2);
      expect(result.summary.qualifications).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(2);
    });

    test("filters by search term", async () => {
      await getFilteredOpportunitiesAndQualifications({ search: "software" });
      expect(mockQueryBuilder.or).toHaveBeenCalled();
    });

    test("filters by location", async () => {
      await getFilteredOpportunitiesAndQualifications({ location: "Gauteng" });
      expect(mockQueryBuilder.ilike).toHaveBeenCalledWith("location", expect.stringContaining("Gauteng"));
    });

    test("filters by nqf level", async () => {
      await getFilteredOpportunitiesAndQualifications({ nqfLevel: 7 });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("nqf_level", 7);
    });

    test("filters by field", async () => {
      await getFilteredOpportunitiesAndQualifications({ field: "IT" });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("field", "IT");
    });

    test("handles pagination correctly", async () => {
      await getFilteredOpportunitiesAndQualifications({ page: 2, limit: 5 });
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(5, 9);
    });

    // test("validates invalid page/limit values", async () => {
    //   await getFilteredOpportunitiesAndQualifications({ page: -1, limit: -5 });
    //   // The service should default to page 1, limit 12
    //   // So range should be called with (0, 11) for 12 items
    //   expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 11);
    // });
    test("calls correct qualification RPC based on filters", async () => {
      await getFilteredOpportunitiesAndQualifications({ search: "computer" });
      expect(mockRpc).toHaveBeenCalledWith("search_qualifications", { search_term: "computer" });

      mockRpc.mockClear();
      await getFilteredOpportunitiesAndQualifications({ field: "IT" });
      expect(mockRpc).toHaveBeenCalledWith("get_qualifications_by_field", { field_input: "IT" });

      mockRpc.mockClear();
      await getFilteredOpportunitiesAndQualifications({ nqfLevel: 7 });
      expect(mockRpc).toHaveBeenCalledWith("get_qualifications_by_nqf_level", { level_input: 7 });

      mockRpc.mockClear();
      await getFilteredOpportunitiesAndQualifications({});
      expect(mockRpc).toHaveBeenCalledWith("get_all_qualifications");
    });

    test("throws error when opportunities query fails", async () => {
      mockQueryBuilder.range.mockReturnValue({ data: null, error: { message: "DB error" }, count: 0 });
      await expect(getFilteredOpportunitiesAndQualifications()).rejects.toThrow("DB error");
    });

    test("throws error when qualification RPC fails", async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: "Qual RPC failed" } });
      await expect(getFilteredOpportunitiesAndQualifications()).rejects.toThrow("Qual RPC failed");
    });

    test("handles empty qualifications response", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });
      const result = await getFilteredOpportunitiesAndQualifications();
      expect(result.summary.qualifications).toBe(0);
    });
  });

  describe("provider CRUD and admin functions", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("createOpportunity inserts and returns the inserted record", async () => {
      // Mock profiles -> returns profile by user_id
      mockFrom.mockImplementation((table) => {
        if (table === "profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 10 } }),
              }),
            }),
          };
        }

        if (table === "provider_profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 20 }, error: null }) }),
            }),
          };
        }

        if (table === "opportunities") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 99 }, error: null }) }),
            }),
          };
        }

        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      const inserted = await createOpportunity({
        userId: "u1",
        data: { title: "Test" },
        status: "pending",
      });

      expect(inserted).toEqual({ id: 99 });
    });

    test("updateOpportunityForProvider updates when authorized", async () => {
      const providerId = 20;
      const oppId = 55;

      // First call: returns chain for fetch (select().eq().maybeSingle())
      const fetchChain = {
        select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { id: oppId, provider_id: providerId }, error: null }) }) }),
      };

      // Second call: returns chain for update (update().eq().select().single())
      const updateChain = {
        update: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: oppId, title: "Updated" }, error: null }) }) }) }),
      };

      mockFrom.mockImplementationOnce((table) => fetchChain).mockImplementationOnce((table) => updateChain);

      const updated = await updateOpportunityForProvider({
        providerId,
        opportunityId: oppId,
        data: { title: "Updated" },
      });

      expect(updated).toEqual({ id: oppId, title: "Updated" });
    });

    test("getOpportunityForProvider returns opportunity when authorized", async () => {
      const providerId = 20;
      const oppId = 77;

      mockFrom.mockImplementation((table) => {
        if (table === "opportunities") {
          return {
            select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { id: oppId, provider_id: providerId }, error: null }) }) }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      const result = await getOpportunityForProvider({ providerId, opportunityId: oppId });

      expect(result).toEqual({ id: oppId, provider_id: providerId });
    });

    test("admin functions getPending/getApproved/updateStatus/deleteOpportunityById call supabase correctly", async () => {
      // Mock list by status
      mockFrom.mockImplementation((table) => {
        if (table === "opportunities") {
          return {
            select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ order: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) }) }),
            update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
            delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      const pending = await getPending();
      expect(pending).toEqual([{ id: 1 }]);

      const approved = await getApproved();
      expect(approved).toEqual([{ id: 1 }]);

      await expect(updateStatus(5, "approved")).resolves.toBeUndefined();
      await expect(deleteOpportunityById(9)).resolves.toBeUndefined();
    });

    test("createOpportunity throws when profile is missing", async () => {
      mockFrom.mockImplementation((table) => {
        if (table === "profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      await expect(createOpportunity({ userId: "missing", data: { title: "Test" }, status: "pending" }))
        .rejects.toThrow("Profile not found for authenticated user");
    });

    test("createOpportunity throws when provider profile is missing", async () => {
      mockFrom.mockImplementation((table) => {
        if (table === "profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 10 }, error: null }),
              }),
            }),
          };
        }

        if (table === "provider_profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }

        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      await expect(createOpportunity({ userId: "u1", data: { title: "Test" }, status: "pending" }))
        .rejects.toThrow("Provider profile not found");
    });

    test("updateOpportunityForProvider throws when not found", async () => {
      mockFrom.mockImplementation((table) => {
        if (table === "opportunities") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      await expect(updateOpportunityForProvider({ providerId: 1, opportunityId: 2, data: { title: "X" } }))
        .rejects.toThrow("Opportunity not found");
    });

    test("updateOpportunityForProvider throws when not authorized", async () => {
      mockFrom.mockImplementation((table) => {
        if (table === "opportunities") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: { id: 2, provider_id: 9 }, error: null }),
              }),
            }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      await expect(updateOpportunityForProvider({ providerId: 1, opportunityId: 2, data: { title: "X" } }))
        .rejects.toThrow("Not authorized to update this opportunity");
    });

    test("updateOpportunityForProvider throws on update error", async () => {
      const fetchChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: 2, provider_id: 1 }, error: null }),
          }),
        }),
      };
      const updateChain = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: "Update failed" } }),
            }),
          }),
        }),
      };

      mockFrom.mockImplementationOnce(() => fetchChain).mockImplementationOnce(() => updateChain);

      await expect(updateOpportunityForProvider({ providerId: 1, opportunityId: 2, data: { title: "X" } }))
        .rejects.toThrow("Update failed");
    });

    test("getOpportunityForProvider throws when not found or forbidden", async () => {
      mockFrom.mockImplementationOnce((table) => {
        if (table === "opportunities") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }) }),
            }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });
      await expect(getOpportunityForProvider({ providerId: 1, opportunityId: 2 })).rejects.toThrow("Opportunity not found");

      mockFrom.mockImplementationOnce((table) => {
        if (table === "opportunities") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({ maybeSingle: jest.fn().mockResolvedValue({ data: { id: 2, provider_id: 9 }, error: null }) }),
            }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });
      await expect(getOpportunityForProvider({ providerId: 1, opportunityId: 2 })).rejects.toThrow("Not authorized to view this opportunity");
    });

    test("getPending, getApproved, updateStatus and deleteOpportunityById cover success and error paths", async () => {
      mockFrom.mockImplementation((table) => {
        if (table === "opportunities") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      await expect(getPending()).resolves.toEqual([{ id: 1 }]);
      await expect(getApproved()).resolves.toEqual([{ id: 1 }]);
      await expect(updateStatus(5, "approved")).resolves.toBeUndefined();
      await expect(deleteOpportunityById(9)).resolves.toBeUndefined();

      mockFrom.mockImplementation((table) => {
        if (table === "opportunities") {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn(() => {
                throw new Error("Update failed");
              }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn(() => {
                throw new Error("Delete failed");
              }),
            }),
          };
        }
        return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      await expect(updateStatus(6, "approved")).rejects.toThrow("Update failed");
      await expect(deleteOpportunityById(10)).rejects.toThrow("Delete failed");
    });
  });
});