// frontend/src/services/providerProfileService.js
//
// Connects the provider profile UI to the backend profile routes.

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

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

async function apiFetch(path, options = {}) {
	const token = getAuthToken();
	const headers = {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...(options.headers || {}),
	};

	const response = await fetch(resolveUrl(path), {
		credentials: "include",
		...options,
		headers,
	});

	let payload = null;
	const contentType = response.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		payload = await response.json();
	} else {
		const text = await response.text();
		payload = text ? { error: text } : null;
	}

	if (!response.ok) {
		throw new Error(payload?.error || payload?.message || `Request failed: ${response.status}`);
	}

	return payload;
}

function normalizeProfilePayload(payload) {
	return payload?.profile ?? payload?.data ?? payload;
}

function buildProviderProfilePath(providerProfileId) {
	const id = providerProfileId ?? "me";
	return `/api/profile/provider/${encodeURIComponent(id)}`;
}

export async function fetchProviderProfileByUserId(userId) {
	return normalizeProfilePayload(
        await apiFetch(buildProviderProfilePath(userId))
    );
}

export async function fetchProviderProfile(providerProfileId) {
	return normalizeProfilePayload(
        await apiFetch(buildProviderProfilePath(providerProfileId)));
}

export async function editProviderProfile(userId, updates) {
	return normalizeProfilePayload(
		await apiFetch(buildProviderProfilePath(userId), {
			method: "PUT",
			body: JSON.stringify(updates ?? {}),
		})
	);
}

