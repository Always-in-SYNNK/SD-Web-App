// frontend/src/services/adminAnalyticsService.js
// Admin-specific analytics service

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

async function adminApiFetch(path) {
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

export async function getAdminApplicationVolume() {
    const json = await adminApiFetch("/api/analytics/admin/applications");
    return {
        data: json.data,
        totals: json.totals,
    };
}