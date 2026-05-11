// frontend/src/services/adminAnalyticsService.js
// Admin-specific analytics service

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthToken = () => {
    const token = localStorage.getItem("token");
    return token;
};

async function adminApiFetch(path) {
    const token = getAuthToken();
    const fullUrl = `${API_BASE_URL}${path}`;
    
    console.log("📡 [Admin] Fetching:", fullUrl);
    
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

    const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    console.error("Expected JSON but got HTML:", text.substring(0, 200));
    throw new Error("Invalid response from server. Expected JSON but got text/html");
  }


    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || `Request failed: ${res.status}`);
    }

    const json = await res.json();
    
    if (!json.success) {
        throw new Error(json.error || "Request failed");
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