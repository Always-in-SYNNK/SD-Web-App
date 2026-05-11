const rawApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'http://localhost:3000';

const normalizedApiRoot = rawApiUrl.replace(/\/$/, '');
const API_BASE_URL = `${normalizedApiRoot}/api`;

async function handleResponse(response) {
  let payload;

  try {
    payload = await response.json();
  } catch {
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

export async function getMatchingOpportunities(token) {
  const response = await fetch(`${API_BASE_URL}/opportunities/matches`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}