import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/opportunities`;

function toError(err) {
  const message =
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong while saving the opportunity.";

  return new Error(message);
}

export async function publishOpportunity(data) {
  try {
    const res = await axios.post(`${API}/publish`, data, {
      withCredentials: true,
    });

    return {
      data: res?.data?.data ?? null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: toError(err),
    };
  }
}

export async function saveDraft(data) {
  try {
    const res = await axios.post(`${API}/draft`, data, {
      withCredentials: true,
    });

    return {
      data: res?.data?.data ?? null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: toError(err),
    };
  }
}