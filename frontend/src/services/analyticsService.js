// frontend/src/services/analyticsService.js
//
// Connects to the real backend analytics endpoints.
// The backend uses providerAuthMiddleware — the user must be logged in as a provider.
//
// Base URL comes from your existing VITE_API_URL env variable —
// same pattern used across all other service files in this project.
// IMPORTANT: Uses RELATIVE paths (/api/...) so Vite proxy handles the request.
// No CORS issues because browser thinks it's calling same origin (localhost:5173).


//const API_URL = import.meta.env.VITE_API_URL; this is what was causing the CORS error because the orgin was different. The URL call for the 3000 port not 5173.

// ─── Shared fetch helper ──────────────────────────────────────────────────────
// Mirrors the pattern in your other service files (credentials: "include"
// sends the session cookie that providerAuthMiddleware validates).
// Get token from localStorage (where your login stores it)
// Change from relative path to absolute URL
const API_BASE_URL = 'http://localhost:3000';

const getAuthToken = () => {
  // token is stored as "token" - use that
  const token = localStorage.getItem("token");
  console.log("🔑 Getting token from localStorage:", token ? "Token found (length: " + token.length + ")" : "No token found");
  return token;
};
async function apiFetch(path) {
  const token = getAuthToken();

  console.log("📡 Fetching:", path);
  console.log("🔑 Token being sent:", token ? "Yes ✅" : "No ❌");

   const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add Authorization header with Bearer token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }


  const res = await fetch(path, { 
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
    }
  });

  console.log("📡 Response status:", res.status);

  const json = await res.json();
  console.log("📡 Response:", json);

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
// Returns CSV-ready data
export async function getExportData() {
  const json = await apiFetch("/api/analytics/export");
  return json.data || [];
}