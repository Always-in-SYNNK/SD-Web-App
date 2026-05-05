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
  const res  = await fetch(`${API_URL}${path}`, { credentials: "include" });
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