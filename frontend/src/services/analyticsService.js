// frontend/src/services/analyticsService.js
//
// Connects to the real backend analytics endpoints.
// The backend uses providerAuthMiddleware — the user must be logged in as a provider.
//
// Base URL comes from your existing VITE_API_URL env variable —
// same pattern used across all other service files in this project.

const API_URL = import.meta.env.VITE_API_URL;

// ─── Shared fetch helper ──────────────────────────────────────────────────────
// Mirrors the pattern in your other service files (credentials: "include"
// sends the session cookie that providerAuthMiddleware validates).
async function apiFetch(path) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res  = await fetch(`${API_URL}${path}`, { credentials: "include", headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed: ${res.status}`);
  }

  return json;
}

// ─── GET /api/analytics/applications ─────────────────────────────────────────
// Backend returns:
//   success — true/false
//   data    — [{ opportunityTitle, count, status, location,
//                opportunityId, statusBreakdown }]
//   totals  — { totalApplications, activeOpportunities, averagePerOpportunity }
//
// Totals now come from the backend — we no longer calculate them on the frontend.
export async function getApplicationVolume() {
  const json = await apiFetch("/api/analytics/applications");
  return {
    data:   json.data,    // array → fed into chart + table
    totals: json.totals,  // object → fed into stat cards
  };
}

// ─── GET /api/analytics/trends ───────────────────────────────────────────────
// Returns array of { month, year, applications } for the last 6 months.
// Not used on the main page yet — wired up and ready for a future trend chart.
export async function getApplicationTrends() {
  const json = await apiFetch("/api/analytics/trends");
  return json.data;
}


// ─── GET /api/analytics/placements ──────────────────────────────────────────
// Global placement analytics (admin view)
//
// Returns:
//     [{sector, totalApplications, acceptedApplications, placementRate}]
//
// Used for:
// - placement rate bar chart
// - accepted placements pie chart
//
export async function getPlacementRates() {
  const json = await apiFetch("/api/analytics/placements");

  const data = (json.data || []).map((item) => ({
    sector: item.sector || "Unknown",
    totalApplications: Number(item.total_applications ?? item.totalApplications ?? 0),
    acceptedApplications: Number(item.accepted_applications ?? item.acceptedApplications ?? 0),
    placementRate: Number(item.placement_rate ?? item.placementRate ?? 0),
  }));

  return {
    raw: data,

    // The charts consume the normalized objects directly.
    chartData: data,

    totals: {
      totalApplications: data.reduce((sum, item) => sum + (item.totalApplications || 0), 0),
      totalAccepted: data.reduce((sum, item) => sum + (item.acceptedApplications || 0), 0),
    },
  };
}


// ─── GET /api/analytics/provider-placements ─────────────────────────────────
// Provider-specific placement analytics
//
// Returns ONLY analytics for the logged-in provider's opportunities.
//
// Returns:
//     [{sector, totalApplications, acceptedApplications, placementRate}]
//
// Used for:
// - provider analytics dashboard
// - provider-specific charts
//
export async function getProviderPlacementRates() {
  const json = await apiFetch(
    "/api/analytics/provider-placements"
  );

  return (json.data || []).map((item) => ({
    sector:               item.sector || "Unknown",
    totalApplications:    Number(item.total_applications ?? item.totalApplications ?? 0),
    acceptedApplications: Number(item.accepted_applications ?? item.acceptedApplications ?? 0),
    placementRate:        Number(item.placement_rate ?? item.placementRate ?? 0),
  }));
}


// ─── GET /api/analytics/export ───────────────────────────────────────────────
// Fetches CSV-ready data from the backend and triggers a browser file download.
export async function exportAnalytics() {
  const json = await apiFetch("/api/analytics/export");

  if (!json.data || json.data.length === 0) return;

  const headers = Object.keys(json.data[0]);
  const rows    = json.data.map((row) =>
    headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
  );

  const csv  = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `analytics-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}