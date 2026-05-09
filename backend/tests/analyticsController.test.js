import { jest } from "@jest/globals";

const mockAnalyticsService = {
    getApplicationsPerOpportunity: jest.fn(),
    getApplicationTrends: jest.fn(),
    exportAnalyticsData: jest.fn(),
    getPlacementRatesBySector: jest.fn(),
    getProviderPlacementRatesBySector: jest.fn(),
};

jest.unstable_mockModule("../src/services/analyticsService.js", () => mockAnalyticsService);

const {
    getApplicationAnalytics,
    getTrendAnalytics,
    exportAnalytics,
    getPlacementRates,
    getProviderPlacementRates,
} = await import("../src/controllers/analyticsController.js");

const {
    getApplicationsPerOpportunity,
    getApplicationTrends,
    exportAnalyticsData,
    getPlacementRatesBySector,
    getProviderPlacementRatesBySector,
} = mockAnalyticsService;

describe("Analytics Controller", () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            user: { profileId: "test-provider-123", id: "test-provider-123", role: "provider" },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe("getApplicationAnalytics", () => {
        test("should return analytics data successfully for authenticated provider", async () => {
            const mockServiceResponse = {
                data: [
                    { opportunityTitle: "Test Role", count: 5, status: "approved" },
                    { opportunityTitle: "Another Role", count: 3, status: "pending" },
                ],
                totals: {
                    totalApplications: 8,
                    activeOpportunities: 1,
                    averagePerOpportunity: 4,
                },
            };

            getApplicationsPerOpportunity.mockResolvedValue(mockServiceResponse);

            await getApplicationAnalytics(mockRequest, mockResponse);

            expect(getApplicationsPerOpportunity).toHaveBeenCalledWith("test-provider-123");
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockServiceResponse.data,
                totals: mockServiceResponse.totals,
            });
        });

        test("should return 401 when user is not authenticated", async () => {
            mockRequest.user = null;

            await getApplicationAnalytics(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: expect.stringContaining("Authentication required"),
            });
        });

        test("should fall back to user id when profileId is missing", async () => {
            const mockServiceResponse = {
                data: [],
                totals: {
                    totalApplications: 0,
                    activeOpportunities: 0,
                    averagePerOpportunity: 0,
                },
            };
            getApplicationsPerOpportunity.mockResolvedValue(mockServiceResponse);

            mockRequest.user = { id: "user-123", role: "provider" };

            await getApplicationAnalytics(mockRequest, mockResponse);

            expect(getApplicationsPerOpportunity).toHaveBeenCalledWith("user-123");
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                totals: mockServiceResponse.totals,
            });
        });

        test("should handle service errors with 500 status", async () => {
            const serviceError = new Error("Database connection failed");
            getApplicationsPerOpportunity.mockRejectedValue(serviceError);

            await getApplicationAnalytics(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: "Database connection failed",
            });
        });

        test("should handle invalid provider ID with 400 status", async () => {
            const validationError = new Error("Valid provider profile ID is required");
            getApplicationsPerOpportunity.mockRejectedValue(validationError);

            await getApplicationAnalytics(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: "Valid provider profile ID is required",
            });
        });

        test("should return empty data when provider has no opportunities", async () => {
            const emptyResponse = {
                data: [],
                totals: {
                    totalApplications: 0,
                    activeOpportunities: 0,
                    averagePerOpportunity: 0,
                },
            };
            getApplicationsPerOpportunity.mockResolvedValue(emptyResponse);

            await getApplicationAnalytics(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                totals: emptyResponse.totals,
            });
        });
    });

    describe("getTrendAnalytics", () => {
        test("should return trend data successfully", async () => {
            const mockTrendData = {
                trends: [
                    { month: "Jan", year: 2024, applications: 10 },
                    { month: "Feb", year: 2024, applications: 15 },
                ],
            };
            getApplicationTrends.mockResolvedValue(mockTrendData);

            await getTrendAnalytics(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockTrendData.trends,
            });
        });

        test("should return 401 when user not authenticated for trends", async () => {
            mockRequest.user = null;

            await getTrendAnalytics(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });
    });

    describe("exportAnalytics", () => {
        test("should return export data successfully", async () => {
            const mockExportData = {
                data: [{ "Opportunity Title": "Test", "Total Applications": 5 }],
                metadata: { generatedAt: "2024-01-01", totalOpportunities: 1, totalApplications: 5 },
            };
            exportAnalyticsData.mockResolvedValue(mockExportData);

            await exportAnalytics(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockExportData.data,
                metadata: mockExportData.metadata,
            });
        });

        test("should return 401 when user not authenticated for export", async () => {
            mockRequest.user = null;

            await exportAnalytics(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });
    });

    describe("getPlacementRates", () => {
        test("should return shared placement data successfully", async () => {
            const mockPlacementData = [
                { sector: "Technology", total_applications: 20, accepted_applications: 5, placement_rate: 25 },
            ];
            getPlacementRatesBySector.mockResolvedValue(mockPlacementData);

            await getPlacementRates(mockRequest, mockResponse);

            expect(getPlacementRatesBySector).toHaveBeenCalledWith();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockPlacementData,
            });
        });
    });

    describe("getProviderPlacementRates", () => {
        test("should pass the authenticated provider id to the provider placement service", async () => {
            const mockPlacementData = [
                { sector: "Health", total_applications: 12, accepted_applications: 3, placement_rate: 25 },
            ];
            getProviderPlacementRatesBySector.mockResolvedValue(mockPlacementData);

            await getProviderPlacementRates(mockRequest, mockResponse);

            expect(getProviderPlacementRatesBySector).toHaveBeenCalledWith("test-provider-123");
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockPlacementData,
            });
        });

        test("should return 401 when user is not authenticated", async () => {
            mockRequest.user = null;

            await getProviderPlacementRates(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: expect.stringContaining("Authentication required"),
            });
        });
    });
});