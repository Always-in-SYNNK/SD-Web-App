const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  console.log('🔍 [employerApplicationService] Token exists:', !!token);
  if (token) {
    console.log('🔍 [employerApplicationService] Token preview:', token.substring(0, 30) + '...');
  }
  return token;
};

export async function getApplicationsForOpportunity(opportunityId) {
  const token = getAuthToken();  // ← USING the function here
  console.log('📡 [employerApplicationService] Fetching applications for opportunity:', opportunityId);
  console.log('📡 [employerApplicationService] Full URL:', `${API_URL}/api/employer/applications/opportunity/${opportunityId}`);

  const response = await fetch(
    `${API_URL}/api/employer/applications/opportunity/${opportunityId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
         ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
  );

  console.log('📡 [employerApplicationService] Response status:', response.status);
  
  const data = await response.json();
  console.log('📡 [employerApplicationService] Response data:', data);
  
    if (!response.ok) {
    console.error('❌ [employerApplicationService] Error:', data.error);
    throw new Error(data.error || 'Failed to fetch applications');
  }
  return data;
}

export async function updateApplicationStatus(applicationId, status) {
  const token = getAuthToken();  // ← USING the function here
  console.log('📡 [employerApplicationService] Updating application:', applicationId, 'to status:', status);
  
  const response = await fetch(
    `${API_URL}/api/employer/applications/${applicationId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
         ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ status })
    }
  );

   console.log('📡 [employerApplicationService] Response status:', response.status);
  
  const data = await response.json();
   console.log('📡 [employerApplicationService] Response data:', data);
  
   if (!response.ok) {
    console.error('❌ [employerApplicationService] Error:', data.error);
    throw new Error(data.error || 'Failed to update status');
  }
  return data;
}