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
  getFilteredOpportunitiesAndQualifications
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
});