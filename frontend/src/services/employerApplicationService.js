const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getApplicationsForOpportunity(opportunityId) {
  const response = await fetch(
    `${API_URL}/api/employer/applications/opportunity/${opportunityId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    }
  );
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update status');
  return data;
}