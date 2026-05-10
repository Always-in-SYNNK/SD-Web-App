import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/api/opportunities`;

const getAdminAuthConfig = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    withCredentials: true,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

function toError(err) {
  const message =
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong while saving the opportunity.";

  return new Error(message);
}

/* PROVIDER */
export async function publishOpportunity(data) {
  try {
    const res = await axios.post(`${API}/publish`, data, getAdminAuthConfig());

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

export const updateOpportunity = async (id, fields) => {
  try {
    const res = await axios.patch(`${API}/${id}`, fields, getAdminAuthConfig());
    return { data: res?.data?.data ?? null, error: null };
  } catch (err) {
    return { data: null, error: toError(err) };
  }
};

export const getOpportunityById = async (id) => {
  try {
    const res = await axios.get(`${API}/${id}`, getAdminAuthConfig());
    return { data: res?.data?.data ?? null, error: null };
  } catch (err) {
    return { data: null, error: toError(err) };
  }
};

export async function saveDraft(data) {
  try {
    const res = await axios.post(`${API}/draft`, data, getAdminAuthConfig());

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

/* ADMIN */
export const getPendingOpportunities = async () => {
  try {
    const res = await axios.get(`${API}/pending`, getAdminAuthConfig());

    const payload = res?.data;
    const pending = Array.isArray(payload) ? payload : payload?.data ?? [];

    return {
      data: pending,
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: toError(err),
    };
  }
};

export const getApprovedOpportunities = async () => {
  try {
    const res = await axios.get(`${API}/approved`, getAdminAuthConfig());

    const payload = res?.data;
    const approved = Array.isArray(payload) ? payload : payload?.data ?? [];

    return { data: approved, error: null };
  } catch (err) {
    return { data: [], error: toError(err) };
  }
};

export const approveOpportunity = async (id) => {
  try {
    const res = await axios.patch(`${API}/${id}/approve`, null, getAdminAuthConfig());
    const payload = res?.data;

    return {
      data: payload?.data ?? payload ?? { id, status: "approved" },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: toError(err),
    };
  }
};

export const rejectOpportunity = async (id) => {
  try {
    const res = await axios.patch(`${API}/${id}/reject`, null, getAdminAuthConfig());
    const payload = res?.data;

    return {
      data: payload?.data ?? payload ?? { id, status: "rejected" },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: toError(err),
    };
  }
};

export const deleteOpportunity = async (id) => {
  try {
    const res = await axios.delete(`${API}/${id}`, getAdminAuthConfig());
    const payload = res?.data;

    return {
      data: payload?.data ?? payload ?? { id },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: toError(err),
    };
  }
};