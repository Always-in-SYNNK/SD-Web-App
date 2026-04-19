import axios from "axios";

export async function applyToOpportunity(opportunityId) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/applications`,
    { opportunityId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}