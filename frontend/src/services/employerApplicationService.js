const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthConfig = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('No token found');
  }
  return {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

export async function getApplicationsForOpportunity(opportunityId) {
  const response = await fetch(
    `${API_URL}/api/employer/applications/opportunity/${opportunityId}`,
    {
      method: 'GET',
      ...getAuthConfig(),
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) throw new Error(data.error || 'Failed to fetch applications');
  return data;
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
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update status');
  return data;
}