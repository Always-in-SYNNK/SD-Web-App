import { 
    getApplicationsPerOpportunity, 
    getApplicationTrends,
    exportAnalyticsData,
    getPlacementRatesBySector,
    getProviderPlacementRatesBySector
} from "../services/analyticsService.js";

/**
 * Analytics Controller - Handles HTTP requests for analytics endpoints
 * Maps frontend requests to service layer and formats responses
 */

/**
 * GET /api/analytics/applications
 * Returns application volume per opportunity for the authenticated provider
 */
export async function getApplicationAnalytics(req, res) {
    try {
        // Extract provider ID from authenticated user
        const providerProfileId = req.user?.profileId || req.user?.id;

        if (!providerProfileId) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required. Please log in again." 
            });
        }

        // Fetch analytics data from service
        const analyticsData = await getApplicationsPerOpportunity(providerProfileId);

        // Return data in format expected by frontend
        return res.status(200).json({
            success: true,
            data: analyticsData.data,  // Frontend expects array directly
            totals: analyticsData.totals
        });

    } catch (error) {
        console.error("[AnalyticsController] Error in getApplicationAnalytics:", error);
        
        // Determine appropriate error response
        const statusCode = error.message.includes('profile ID') ? 400 : 500;
        return res.status(statusCode).json({ 
            success: false, 
            error: error.message || "Failed to fetch analytics data" 
        });
    }
}

/**
 * GET /api/analytics/trends
 * Returns application trends over time
 */
export async function getTrendAnalytics(req, res) {
    try {
        const providerProfileId = req.user?.profileId || req.user?.id;

        if (!providerProfileId) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required" 
            });
        }

        const trendData = await getApplicationTrends(providerProfileId);

        return res.status(200).json({
            success: true,
            data: trendData.trends
        });

    } catch (error) {
        console.error("[AnalyticsController] Error in getTrendAnalytics:", error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

/**
 * GET /api/analytics/export
 * Returns CSV-ready analytics data for download
 */
export async function exportAnalytics(req, res) {
    try {
        const providerProfileId = req.user?.profileId || req.user?.id;

        if (!providerProfileId) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required" 
            });
        }

        const exportData = await exportAnalyticsData(providerProfileId);

        return res.status(200).json({
            success: true,
            data: exportData.data,
            metadata: exportData.metadata
        });

    } catch (error) {
        console.error("[AnalyticsController] Error in exportAnalytics:", error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

/**
 * GET /api/analytics/placements
 * Returns placement rates by sector
 */
export async function getPlacementRates(req, res) {
    try {
        const placementData = await getPlacementRatesBySector();

        return res.status(200).json({
            success: true,
            data: placementData
        });

    } catch (error) {
        console.error("[AnalyticsController] Error in getPlacementRates:", error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

/**
 * GET /api/analytics/provider-placements
 * Returns placement rates by sector for the authenticated provider
 */
export async function getProviderPlacementRates(req, res) {
    try {
        const providerProfileId = req.user?.profileId || req.user?.id;

        if (!providerProfileId) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required" 
            });
        }

        const placementData = await getProviderPlacementRatesBySector(providerProfileId);

        return res.status(200).json({
            success: true,
            data: placementData
        });

    } catch (error) {
        console.error("[AnalyticsController] Error in getProviderPlacementRates:", error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
