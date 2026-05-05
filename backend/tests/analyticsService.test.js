import { 
    getApplicationsPerOpportunity,
    getApplicationTrends,
    exportAnalyticsData 
} from "../src/services/analyticsService.js";
import { supabase } from "../src/config/supabaseClient.js";

// Mock supabase client
jest.mock("../src/config/supabaseClient.js", () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe("Analytics Service", () => {
    const mockProviderId = "test-provider-123";
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getApplicationsPerOpportunity", () => {
        test("should return formatted analytics data for provider with opportunities", async () => {
            // Mock opportunities data
            const mockOpportunities = {
                data: [
                    { id: "opp-1", title: "Software Engineer Intern", location: "Remote", status: "approved", created_at: "2024-01-01", closing_date: "2024-12-31" },
                    { id: "opp-2", title: "Data Science Intern", location: "NYC", status: "approved", created_at: "2024-01-02", closing_date: "2024-12-31" },
                    { id: "opp-3", title: "Product Manager", location: "SF", status: "pending", created_at: "2024-01-03", closing_date: "2024-12-31" },
                ],
                error: null,
            };

            // Mock applications data
            const mockApplications = {
                data: [
                    { id: "app-1", status: "shortlisted", opportunity_id: "opp-1", created_at: "2024-01-15" },
                    { id: "app-2", status: "accepted", opportunity_id: "opp-1", created_at: "2024-01-16" },
                    { id: "app-3", status: "pending", opportunity_id: "opp-1", created_at: "2024-01-17" },
                    { id: "app-4", status: "pending", opportunity_id: "opp-2", created_at: "2024-01-18" },
                    { id: "app-5", status: "shortlisted", opportunity_id: "opp-2", created_at: "2024-01-19" },
                ],
                error: null,
            };

            // Setup mock chain
            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            const mockIn = jest.fn();
            
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce(mockOpportunities);
            
            mockSelect.mockReturnValue({ in: mockIn });
            mockIn.mockResolvedValueOnce(mockApplications);
            
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await getApplicationsPerOpportunity(mockProviderId);

            // Assertions
            expect(result).toHaveProperty("data");
            expect(result).toHaveProperty("totals");
            expect(result.data).toHaveLength(3);
            expect(result.totals.totalApplications).toBe(5);
            expect(result.totals.activeOpportunities).toBe(2);
            expect(result.totals.averagePerOpportunity).toBe(2);
            
            // Check sorting by count descending
            expect(result.data[0].opportunityTitle).toBe("Software Engineer Intern");
            expect(result.data[0].count).toBe(3);
        });

        test("should return empty analytics for provider with no opportunities", async () => {
            const mockOpportunities = {
                data: [],
                error: null,
            };

            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce(mockOpportunities);
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await getApplicationsPerOpportunity(mockProviderId);

            expect(result.data).toEqual([]);
            expect(result.totals.totalApplications).toBe(0);
            expect(result.totals.activeOpportunities).toBe(0);
            expect(result.totals.averagePerOpportunity).toBe(0);
        });

        test("should handle opportunities with zero applications", async () => {
            const mockOpportunities = {
                data: [
                    { id: "opp-1", title: "No Apps Role", location: "Remote", status: "approved", created_at: "2024-01-01", closing_date: "2024-12-31" },
                ],
                error: null,
            };

            const mockApplications = {
                data: [],
                error: null,
            };

            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            const mockIn = jest.fn();
            
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce(mockOpportunities);
            mockSelect.mockReturnValue({ in: mockIn });
            mockIn.mockResolvedValueOnce(mockApplications);
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await getApplicationsPerOpportunity(mockProviderId);

            expect(result.data[0].count).toBe(0);
            expect(result.totals.totalApplications).toBe(0);
            expect(result.totals.averagePerOpportunity).toBe(0);
        });

        test("should include status breakdown for each opportunity", async () => {
            const mockOpportunities = {
                data: [{ id: "opp-1", title: "Test Role", location: "Remote", status: "approved", created_at: "2024-01-01", closing_date: "2024-12-31" }],
                error: null,
            };

            const mockApplications = {
                data: [
                    { id: "app-1", status: "pending", opportunity_id: "opp-1", created_at: "2024-01-15" },
                    { id: "app-2", status: "shortlisted", opportunity_id: "opp-1", created_at: "2024-01-16" },
                    { id: "app-3", status: "accepted", opportunity_id: "opp-1", created_at: "2024-01-17" },
                    { id: "app-4", status: "rejected", opportunity_id: "opp-1", created_at: "2024-01-18" },
                ],
                error: null,
            };

            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            const mockIn = jest.fn();
            
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce(mockOpportunities);
            mockSelect.mockReturnValue({ in: mockIn });
            mockIn.mockResolvedValueOnce(mockApplications);
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await getApplicationsPerOpportunity(mockProviderId);

            expect(result.data[0].statusBreakdown).toBeDefined();
            expect(result.data[0].statusBreakdown.pending).toBe(1);
            expect(result.data[0].statusBreakdown.shortlisted).toBe(1);
            expect(result.data[0].statusBreakdown.accepted).toBe(1);
            expect(result.data[0].statusBreakdown.rejected).toBe(1);
        });

        test("should throw error when provider ID is invalid", async () => {
            await expect(getApplicationsPerOpportunity(null)).rejects.toThrow("Valid provider profile ID is required");
            await expect(getApplicationsPerOpportunity("")).rejects.toThrow("Valid provider profile ID is required");
            await expect(getApplicationsPerOpportunity(123)).rejects.toThrow("Valid provider profile ID is required");
        });

        test("should throw error when Supabase opportunities fetch fails", async () => {
            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce({ data: null, error: new Error("Database connection failed") });
            supabase.from.mockReturnValue({ select: mockSelect });

            await expect(getApplicationsPerOpportunity(mockProviderId)).rejects.toThrow("Failed to fetch opportunities");
        });

        test("should sort opportunities by application count descending", async () => {
            const mockOpportunities = {
                data: [
                    { id: "opp-1", title: "High Volume", location: "Remote", status: "approved", created_at: "2024-01-01", closing_date: "2024-12-31" },
                    { id: "opp-2", title: "Medium Volume", location: "Remote", status: "approved", created_at: "2024-01-01", closing_date: "2024-12-31" },
                    { id: "opp-3", title: "Low Volume", location: "Remote", status: "approved", created_at: "2024-01-01", closing_date: "2024-12-31" },
                ],
                error: null,
            };

            const mockApplications = {
                data: [
                    { id: "app-1", status: "pending", opportunity_id: "opp-1", created_at: "2024-01-15" },
                    { id: "app-2", status: "pending", opportunity_id: "opp-1", created_at: "2024-01-16" },
                    { id: "app-3", status: "pending", opportunity_id: "opp-1", created_at: "2024-01-17" },
                    { id: "app-4", status: "pending", opportunity_id: "opp-2", created_at: "2024-01-18" },
                    { id: "app-5", status: "pending", opportunity_id: "opp-2", created_at: "2024-01-19" },
                    { id: "app-6", status: "pending", opportunity_id: "opp-3", created_at: "2024-01-20" },
                ],
                error: null,
            };

            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            const mockIn = jest.fn();
            
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce(mockOpportunities);
            mockSelect.mockReturnValue({ in: mockIn });
            mockIn.mockResolvedValueOnce(mockApplications);
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await getApplicationsPerOpportunity(mockProviderId);

            expect(result.data[0].opportunityTitle).toBe("High Volume");
            expect(result.data[0].count).toBe(3);
            expect(result.data[1].opportunityTitle).toBe("Medium Volume");
            expect(result.data[1].count).toBe(2);
            expect(result.data[2].opportunityTitle).toBe("Low Volume");
            expect(result.data[2].count).toBe(1);
        });
    });

    describe("getApplicationTrends", () => {
        test("should return monthly trend data for the last 6 months", async () => {
            const mockOpportunities = {
                data: [{ id: "opp-1" }, { id: "opp-2" }],
                error: null,
            };

            const mockApplications = {
                data: [
                    { created_at: new Date().toISOString(), status: "pending", opportunity_id: "opp-1" },
                    { created_at: new Date().toISOString(), status: "shortlisted", opportunity_id: "opp-2" },
                ],
                error: null,
            };

            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            const mockIn = jest.fn();
            
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce(mockOpportunities);
            mockSelect.mockReturnValue({ in: mockIn });
            mockIn.mockResolvedValueOnce(mockApplications);
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await getApplicationTrends(mockProviderId);

            expect(result).toHaveProperty("trends");
            expect(result.trends.length).toBeGreaterThanOrEqual(1);
        });

        test("should return empty trends when no opportunities exist", async () => {
            const mockOpportunities = {
                data: [],
                error: null,
            };

            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce(mockOpportunities);
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await getApplicationTrends(mockProviderId);

            expect(result.trends).toEqual([]);
        });
    });

    describe("exportAnalyticsData", () => {
        test("should return formatted export data", async () => {
            const mockOpportunities = {
                data: [
                    { id: "opp-1", title: "Test Role", location: "Remote", status: "approved", created_at: "2024-01-01", closing_date: "2024-12-31" },
                ],
                error: null,
            };

            const mockApplications = {
                data: [
                    { id: "app-1", status: "pending", opportunity_id: "opp-1", created_at: "2024-01-15" },
                    { id: "app-2", status: "accepted", opportunity_id: "opp-1", created_at: "2024-01-16" },
                ],
                error: null,
            };

            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            const mockIn = jest.fn();
            
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockResolvedValueOnce(mockOpportunities);
            mockSelect.mockReturnValue({ in: mockIn });
            mockIn.mockResolvedValueOnce(mockApplications);
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await exportAnalyticsData(mockProviderId);

            expect(result).toHaveProperty("data");
            expect(result).toHaveProperty("metadata");
            expect(result.data).toHaveLength(1);
            expect(result.data[0]["Opportunity Title"]).toBe("Test Role");
            expect(result.data[0]["Total Applications"]).toBe(2);
            expect(result.metadata.totalOpportunities).toBe(1);
            expect(result.metadata.totalApplications).toBe(2);
        });
    });
});