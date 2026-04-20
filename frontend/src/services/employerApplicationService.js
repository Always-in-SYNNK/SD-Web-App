const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getApplicationsForOpportunity(opportunityId) {
  const token = localStorage.getItem("token");
  
  //console.log("🔍 getApplicationsForOpportunity - Token exists:", !!token);
  //console.log("🔍 OpportunityId:", opportunityId);
  //sensitive info, be careful with logs
  
  if (!token) {
    throw new Error("No token found. Please login again.");
  }

  const response = await fetch(
    `${API_URL}/api/employer/applications/opportunity/${opportunityId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  console.log("📡 Response status:", response.status);
  
  if (!response.ok) throw new Error(data.error || 'Failed to fetch applications');
  return data;
}

export async function updateApplicationStatus(applicationId, status) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No token found. Please login again.");
  }

  const response = await fetch(
    `${API_URL}/api/employer/applications/${applicationId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    }
  );
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update status');
  return data;
}