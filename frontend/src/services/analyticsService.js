// frontend/src/services/analyticsService.js
//
// Connects to backend analytics endpoints.
// URL strategy:
// - In development: always use relative /api paths so Vite proxy handles CORS
// - In production: use VITE_API_URL when provided, otherwise relative paths

const API_BASE = (import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "")).replace(/\/$/, "");

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function resolveUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error("API path must start with '/'");
  }

  return API_BASE ? `${API_BASE}${path}` : path;
}

async function apiFetch(path) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(resolveUrl(path), {
    credentials: "include",
    headers,
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(
      `Invalid response from server. Expected JSON but got ${contentType || "unknown content type"}`
    );
  }

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed: ${res.status}`);
  }

  return json;
}

export async function getApplicationVolume() {
  const json = await apiFetch("/api/analytics/applications");
  return {
    data: json.data,
    totals: json.totals,
  };
}

export async function getApplicationTrends() {
  const json = await apiFetch("/api/analytics/trends");
  return json.data;
}


// ─── GET /api/analytics/placements ──────────────────────────────────────────
// Global placement analytics (admin view)
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
    chartData: data,

    totals: {
      totalApplications: data.reduce((sum, item) => sum + (item.totalApplications || 0), 0),
      totalAccepted: data.reduce((sum, item) => sum + (item.acceptedApplications || 0), 0),
    },
  };
}


// ─── GET /api/analytics/provider-placements ─────────────────────────────────
// Returns ONLY analytics for the logged-in provider's opportunities.
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

export async function getExportData() {
  const json = await apiFetch("/api/analytics/export");
  return json.data || [];
}