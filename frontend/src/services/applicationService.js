import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function applyToOpportunity(opportunityId) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_URL}/applications`,
    { opportunityId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function fetchMyApplications() {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/applications/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}

export async function unapplyFromApplication(applicationId) {
  const token = localStorage.getItem("token");

  const res = await axios.delete(`${API_URL}/applications/${applicationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}