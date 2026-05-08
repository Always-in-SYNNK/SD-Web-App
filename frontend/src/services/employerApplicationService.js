const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
};

const getAuthConfig = (tokenOverride = null) => {
  const token = tokenOverride ?? getStoredToken();

  return {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const handleResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};

export async function getApplicationsForOpportunity(opportunityId) {
  const response = await fetch(
    `${API_URL}/api/employer/applications/opportunity/${opportunityId}`,
    {
      method: 'GET',
      ...getAuthConfig(),
    }
  );

  return handleResponse(response);
}

export async function updateApplicationStatus(applicationId, status) {
  const response = await fetch(
    `${API_URL}/api/employer/applications/${applicationId}`,
    {
      method: 'PATCH',
      ...getAuthConfig(),
      body: JSON.stringify({ status })
    }
  );

  return handleResponse(response);
}

export async function getApplicationDetails(applicationId, token = null) {
  const response = await fetch(
    `${API_URL}/api/employer/applications/${applicationId}/details`,
    {
      method: 'GET',
      ...getAuthConfig(token),
    }
  );

  return handleResponse(response);
}

export async function getApplicationCvSignedUrl(applicationId, token = null) {
  const response = await fetch(
    `${API_URL}/api/employer/applications/${applicationId}/cv/signed-url`,
    {
      method: 'GET',
      ...getAuthConfig(token),
    }
  );

  return handleResponse(response);
}