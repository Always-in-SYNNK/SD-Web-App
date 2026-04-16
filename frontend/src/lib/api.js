const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(response) {
  let payload;

  try {
    payload = await response.json();
  } catch (err) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
      payload?.error ||
      `HTTP ${response.status} ${response.statusText}`
    );
  }

  return payload;
}

export async function getLocations() {
  const response = await fetch(`${API_BASE_URL}/opportunities/filters/locations`);
  return handleResponse(response);
}

export async function getFields() {
  const response = await fetch(`${API_BASE_URL}/opportunities/filters/fields`);
  return handleResponse(response);
}

export async function getNqfLevels() {
  const response = await fetch(`${API_BASE_URL}/opportunities/filters/nqf-levels`);
  return handleResponse(response);
}

export async function getOpportunities(filters = {}) {
  const params = new URLSearchParams();

  if (filters.field) params.append('field', filters.field);
  if (filters.location) params.append('location', filters.location);
  if (filters.nqfLevel) params.append('nqfLevel', filters.nqfLevel);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const url = `${API_BASE_URL}/opportunities?${params.toString()}`;
  console.log("Fetching:", url);

  const response = await fetch(url);

  return handleResponse(response);
}
