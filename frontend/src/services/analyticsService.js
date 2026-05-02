// frontend/src/services/analyticsService.js
//
// ─── FRONTEND HOOK ───────────────────────────────────────────────────────────
// Check your other service files in frontend/src/services/ to see how you
// make API calls. You likely use axios with a base URL from import.meta.env.VITE_API_URL
// Replace the fetch below with your existing axios instance if you have one.
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL;

export async function getApplicationVolume() {
  // ── FRONTEND HOOK: swap for axios if that's what your project uses ─────────
  // Example with axios:
  //   const { data } = await axiosInstance.get("/analytics/applications");
  //   return data.data;

  const res = await fetch(`${API_URL}/api/analytics/applications`, {
    credentials: "include", // send cookies/session — match your other service calls
  });
  if (!res.ok) throw new Error("Failed to fetch analytics data");
  const json = await res.json();
  return json.data; // the array: [{ opportunityTitle, count, status }]
}