// frontend/src/services/analyticsService.js
//
// ─── FRONTEND HOOK ───────────────────────────────────────────────────────────
// Check your other service files in frontend/src/services/ to see how you
// make API calls. You likely use axios with a base URL from import.meta.env.VITE_API_URL
// Replace the fetch below with your existing axios instance if you have one.
// Updated to work with our backend implementation
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get authentication headers for API requests
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Fetch application volume data from backend
 * Returns array of { opportunityTitle, count, status }
 */

  // ── FRONTEND HOOK: swap for axios if that's what your project uses ─────────
  // Example with axios:
  //   const { data } = await axiosInstance.get("/analytics/applications");
  //   return data.data;

export async function getApplicationVolume() {
  try {
    const response = await fetch(`${API_URL}/api/analytics/applications`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch analytics`);
    }

    const result = await response.json();
    
    // Backend returns { success, data, totals }
    // Frontend expects just the data array
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    
    // Fallback to empty array if structure is unexpected
    console.warn("[AnalyticsService] Unexpected response structure:", result);
    return [];
    
  } catch (error) {
    console.error("[AnalyticsService] Error fetching application volume:", error);
    throw error;
  }
}

/**
 * Fetch trend data for line charts
 */
export async function getApplicationTrends() {
  try {
    const response = await fetch(`${API_URL}/api/analytics/trends`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch trends`);
    }

    const result = await response.json();
    return result.success ? result.data : [];
    
  } catch (error) {
    console.error("[AnalyticsService] Error fetching trends:", error);
    return [];
  }
}

/**
 * Export analytics data
 */
export async function exportAnalyticsData() {
  try {
    const response = await fetch(`${API_URL}/api/analytics/export`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to export data`);
    }

    const result = await response.json();
    return result.success ? { data: result.data, metadata: result.metadata } : null;
    
  } catch (error) {
    console.error("[AnalyticsService] Error exporting data:", error);
    return null;
  }
}