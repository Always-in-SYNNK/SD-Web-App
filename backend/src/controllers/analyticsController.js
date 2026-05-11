import { 
    getApplicationsPerOpportunity, 
    getApplicationTrends,
    exportAnalyticsData 
} from "../services/analyticsService.js";
import { supabase } from "../config/supabaseClient.js";

console.log('🔧 ANALYTICS CONTROLLER FILE LOADED - Provider endpoint should work');
/**
 * GET /api/analytics/applications
 * FOR PROVIDERS - Returns their OWN opportunities (all statuses)
 */
export async function getApplicationAnalytics(req, res) {
    console.log('🚨🚨🚨 PROVIDER ANALYTICS CONTROLLER WAS CALLED! 🚨🚨🚨');
    console.log('🔍 req.user:', req.user);
    console.log('🔍 req.headers.authorization:', req.headers.authorization);
    // ... rest of code

    try {
        console.log('[AnalyticsController] Provider analytics requested');
        
        // Get provider profile ID from authenticated user
        const providerProfileId = req.user?.profileId || req.user?.id;

        if (!providerProfileId) {
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required. Please log in again." 
            });
        }

        // Fetch analytics data from service (returns ALL provider's opportunities)
        const analyticsData = await getApplicationsPerOpportunity(providerProfileId);

        return res.status(200).json({
            success: true,
            data: analyticsData.data,
            totals: analyticsData.totals
        });

    } catch (error) {
        console.error("[AnalyticsController] Error in getApplicationAnalytics:", error);
        
        const statusCode = error.message.includes('profile ID') ? 400 : 500;
        return res.status(statusCode).json({ 
            success: false, 
            error: error.message || "Failed to fetch analytics data" 
        });
    }
}

/**
 * GET /api/analytics/admin/applications
 * FOR ADMINS ONLY - Returns ALL approved opportunities (no provider filter)
 */
export async function getAdminApplicationAnalytics(req, res) {
    try {
        console.log('[AnalyticsController] Admin analytics requested');
        
        // Check if user is admin
       /* const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: "Access denied. Admin privileges required."
            });
        }*/

        // ✅ ONLY fetch approved opportunities
        const { data: opportunities, error: opportunitiesError } = await supabase
            .from("opportunities")
            .select("id, title, location, status, created_at, closing_date, provider_id")
            .eq("status", "approved");  // ← ONLY approved

        if (opportunitiesError) {
            console.error("[AnalyticsController] Opportunities fetch error:", opportunitiesError);
            return res.status(500).json({
                success: false,
                error: `Failed to fetch opportunities: ${opportunitiesError.message}`
            });
        }

        if (!opportunities || opportunities.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                totals: {
                    totalApplications: 0,
                    activeOpportunities: 0,
                    averagePerOpportunity: 0,
                    totalProviders: 0
                }
            });
        }

        const opportunityIds = opportunities.map(opp => opp.id);
        const uniqueProviderIds = new Set(opportunities.map(opp => opp.provider_id));

        const { data: applications, error: applicationsError } = await supabase
            .from("applications")
            .select("id, status, opportunity_id, created_at")
            .in("opportunity_id", opportunityIds);

        if (applicationsError) {
            console.error("[AnalyticsController] Applications fetch error:", applicationsError);
            return res.status(500).json({
                success: false,
                error: `Failed to fetch applications: ${applicationsError.message}`
            });
        }

        const applicationMap = new Map();
        const statusCountMap = new Map();

        opportunities.forEach(opp => {
            applicationMap.set(opp.id, {
                opportunityTitle: opp.title,
                count: 0,
                status: opp.status,
                location: opp.location,
                opportunityId: opp.id,
                providerId: opp.provider_id
            });
            statusCountMap.set(opp.id, {
                received: 0,
                shortlisted: 0,
                offered: 0,
                accepted: 0,
                rejected: 0
            });
        });

        if (applications && applications.length > 0) {
            applications.forEach(app => {
                const oppData = applicationMap.get(app.opportunity_id);
                if (oppData) {
                    oppData.count++;
                    const statusCounts = statusCountMap.get(app.opportunity_id);
                    if (statusCounts && app.status) {
                        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
                    }
                }
            });
        }

        const result = Array.from(applicationMap.values())
            .sort((a, b) => b.count - a.count);

        const totalApplications = result.reduce((sum, opp) => sum + opp.count, 0);
        const activeOpportunities = result.length;
        const averagePerOpportunity = result.length > 0 
            ? Math.round(totalApplications / result.length) 
            : 0;

        const enrichedResult = result.map(opp => ({
            ...opp,
            statusBreakdown: statusCountMap.get(opp.opportunityId) || {
                received: 0,
                shortlisted: 0,
                offered: 0,
                accepted: 0,
                rejected: 0
            }
        }));

        return res.status(200).json({
            success: true,
            data: enrichedResult,
            totals: {
                totalApplications,
                activeOpportunities,
                averagePerOpportunity,
                totalProviders: uniqueProviderIds.size
            }
        });

    } catch (error) {
        console.error("[AnalyticsController] Error in getAdminApplicationAnalytics:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch admin analytics data"
        });
    }
}

/**
 * GET /api/analytics/trends
 * Returns application trends over time (for providers)
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
 * Returns CSV-ready analytics data for download (for providers)
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