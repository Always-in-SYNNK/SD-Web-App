import { supabase } from "../config/supabaseClient.js";

/**
 * Analytics Service - Handles all data aggregation for application analytics
 * Provides comprehensive statistics for opportunities and applications
 */

/**
 * Get application volume per opportunity for a specific provider
 * @param {string} providerProfileId - The provider's profile ID from auth
 * @returns {Promise<Object>} Formatted analytics data matching frontend expectations
 */
export async function getApplicationsPerOpportunity(providerProfileId) {
     console.log('🔍 [AnalyticsService] Looking for opportunities with provider_profile_id:', providerProfileId);
    // Input validation
    if (!providerProfileId || typeof providerProfileId !== 'string') {
        throw new Error('Valid provider profile ID is required');
    }

    // Fetch all opportunities for the provider
    const { data: opportunities, error: opportunitiesError } = await supabase
        .from("opportunities")
        .select("id, title, location, status, created_at, closing_date")
        .eq("provider_id", providerProfileId);

    if (opportunitiesError) {
        console.error("[AnalyticsService] Opportunities fetch error:", opportunitiesError);
        throw new Error(`Failed to fetch opportunities: ${opportunitiesError.message}`);
    }

    // Handle case with no opportunities
    if (!opportunities || opportunities.length === 0) {
        return {
            data: [],  // Empty array matching frontend expectation
            totals: {
                totalApplications: 0,
                activeOpportunities: 0,
                averagePerOpportunity: 0
            }
        };
    }

    // Get all application IDs for these opportunities
    const opportunityIds = opportunities.map(opp => opp.id);

    // Fetch applications with status information
    const { data: applications, error: applicationsError } = await supabase
        .from("applications")
        .select("id, status, opportunity_id, created_at")
        .in("opportunity_id", opportunityIds);

    if (applicationsError) {
        console.error("[AnalyticsService] Applications fetch error:", applicationsError);
        throw new Error(`Failed to fetch applications: ${applicationsError.message}`);
    }

    // Create a map for quick application counting
    const applicationMap = new Map();
    const statusCountMap = new Map();

    // Initialize maps with each opportunity
    opportunities.forEach(opp => {
        applicationMap.set(opp.id, {
            opportunityTitle: opp.title,
            count: 0,
            status: opp.status,
            location: opp.location,
            opportunityId: opp.id
        });
        statusCountMap.set(opp.id, {
            pending: 0,
            shortlisted: 0,
            accepted: 0,
            rejected: 0
        });
    });

    // Count applications per opportunity and by status
    if (applications && applications.length > 0) {
        applications.forEach(app => {
            const oppData = applicationMap.get(app.opportunity_id);
            if (oppData) {
                oppData.count++;
                
                // Track status counts
                const statusCounts = statusCountMap.get(app.opportunity_id);
                if (statusCounts && app.status) {
                    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
                }
            }
        });
    }

    // Convert map to array and sort by application count (descending)
    const result = Array.from(applicationMap.values())
        .sort((a, b) => b.count - a.count);

    // Calculate totals for stat cards
    const totalApplications = result.reduce((sum, opp) => sum + opp.count, 0);
    const activeOpportunities = result.filter(opp => opp.status === 'approved').length;
    const averagePerOpportunity = result.length > 0 
        ? Math.round(totalApplications / result.length) 
        : 0;

    // Attach status breakdown to each opportunity
    const enrichedResult = result.map(opp => ({
        ...opp,
        statusBreakdown: statusCountMap.get(opp.opportunityId) || {
            pending: 0,
            shortlisted: 0,
            accepted: 0,
            rejected: 0
        }
    }));

    return {
        data: enrichedResult,  // Matches frontend's expected data structure
        totals: {
            totalApplications,
            activeOpportunities,
            averagePerOpportunity
        }
    };
}

/**
 * Get application trends over time (for future enhancement)
 * @param {string} providerProfileId - The provider's profile ID
 * @returns {Promise<Object>} Trend data by month
 */
export async function getApplicationTrends(providerProfileId) {
    if (!providerProfileId || typeof providerProfileId !== 'string') {
        throw new Error('Valid provider profile ID is required');
    }

    // Fetch opportunities for the provider
    const { data: opportunities, error: oppError } = await supabase
        .from("opportunities")
        .select("id")
        .eq("provider_id", providerProfileId);

    if (oppError) {
        throw new Error(`Failed to fetch opportunities: ${oppError.message}`);
    }

    if (!opportunities || opportunities.length === 0) {
        return { trends: [] };
    }

    const opportunityIds = opportunities.map(opp => opp.id);

    // Fetch all applications with creation dates
    const { data: applications, error: appError } = await supabase
        .from("applications")
        .select("created_at, status")
        .in("opportunity_id", opportunityIds);

    if (appError) {
        throw new Error(`Failed to fetch applications: ${appError.message}`);
    }

    // Group applications by month
    const monthlyData = new Map();
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 5));

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, {
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear(),
            applications: 0
        });
    }

    // Count applications by month
    if (applications && applications.length > 0) {
        applications.forEach(app => {
            const date = new Date(app.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData.has(monthKey)) {
                monthlyData.get(monthKey).applications++;
            }
        });
    }

    // Convert to array and sort chronologically
    const trends = Array.from(monthlyData.values())
        .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month.localeCompare(b.month);
        });

    return { trends };
}

/**
 * Export analytics data as CSV-ready format
 * @param {string} providerProfileId - The provider's profile ID
 * @returns {Promise<Object>} Exportable data
 */
export async function exportAnalyticsData(providerProfileId) {
    const analyticsData = await getApplicationsPerOpportunity(providerProfileId);
    
    // Format data for CSV export
    const exportData = analyticsData.data.map(opp => ({
        'Opportunity Title': opp.opportunityTitle,
        'Total Applications': opp.count,
        'Status': opp.status,
        'Location': opp.location || 'N/A',
        'Pending': opp.statusBreakdown?.pending || 0,
        'Shortlisted': opp.statusBreakdown?.shortlisted || 0,
        'Accepted': opp.statusBreakdown?.accepted || 0,
        'Rejected': opp.statusBreakdown?.rejected || 0
    }));

    return {
        data: exportData,
        metadata: {
            generatedAt: new Date().toISOString(),
            totalOpportunities: analyticsData.data.length,
            totalApplications: analyticsData.totals.totalApplications
        }
    };
}

/**
 * Create empty analytics response for providers with no opportunities
 * @returns {Object} Empty analytics structure
 */
function createEmptyAnalyticsResponse() {
    return {
        data: [],
        totals: {
            totalApplications: 0,
            activeOpportunities: 0,
            averagePerOpportunity: 0
        }
    };
}