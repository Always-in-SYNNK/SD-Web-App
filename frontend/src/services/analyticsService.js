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
// frontend/src/services/analyticsService.js

// Use absolute URL to directly call backend
//const API_BASE_URL = 'http://localhost:3000';

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  console.log("🔑 Getting token from localStorage:", token ? "Token found (length: " + token.length + ")" : "No token found");
  return token;
};

async function apiFetch(path) {
  const token = getAuthToken();
  
  const fullUrl = path; // Use relative path to leverage Vite's proxy and avoid CORS issues
  //Combine API_BASE_URL and path to create fullUrl
 // const fullUrl = `${API_BASE_URL}${path}`;

  console.log("📡 Fetching:", fullUrl);
  console.log("🔑 Token being sent:", token ? "Yes ✅" : "No ❌");

  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, { 
    credentials: "include",
    headers: headers,
  });

  console.log("📡 Response status:", res.status);

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    console.error("Expected JSON but got:", text.substring(0, 200));
    throw new Error(`Invalid response from server. Expected JSON but got ${contentType || 'unknown content type'}`);
  }

  const json = await res.json();
  console.log("📡 Response:", json);

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

export async function getExportData() {
  const json = await apiFetch("/api/analytics/export");
  return json.data || [];
}