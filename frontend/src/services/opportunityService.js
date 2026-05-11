import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/api/opportunities`;

const getSessionConfig = () => ({
  withCredentials: true,
});

const getAuthConfig = () => {
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
    const res = await axios.post(`${API}/publish`, data, getAuthConfig());

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
    const res = await axios.patch(`${API}/${id}`, fields, getAuthConfig());
    return { data: res?.data?.data ?? null, error: null };
  } catch (err) {
    return { data: null, error: toError(err) };
  }
};

export const getOpportunityById = async (id) => {
  try {
    const res = await axios.get(`${API}/${id}`, getAuthConfig());
    return { data: res?.data?.data ?? null, error: null };
  } catch (err) {
    return { data: null, error: toError(err) };
  }
};

export async function saveDraft(data) {
  try {
    const res = await axios.post(`${API}/draft`, data, getAuthConfig());

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
    const res = await axios.get(`${API}/pending`, getAuthConfig());

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
    const res = await axios.get(`${API}/approved`, getAuthConfig());

    const payload = res?.data;
    const approved = Array.isArray(payload) ? payload : payload?.data ?? [];

    return { data: approved, error: null };
  } catch (err) {
    return { data: [], error: toError(err) };
  }
};

export const approveOpportunity = async (id) => {
  try {
    const res = await axios.patch(`${API}/${id}/approve`, null, getAuthConfig());
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
    const res = await axios.patch(`${API}/${id}/reject`, null, getAuthConfig());
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
    const res = await axios.delete(`${API}/${id}`, getAuthConfig());
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

/* SKILLS */
export const getOpportunitySkills = async (opportunityId) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/skills/opportunity/${opportunityId}`,
      getAuthConfig()
    );
    const skills = res?.data?.opportunitySkills ?? [];
    return {
      data: skills.map((s) => ({ id: s.id ?? s.skills_id, name: s.name ?? s.skill_name })),
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: toError(err),
    };
  }
};

export const saveOpportunitySkills = async (opportunityId, skillIds) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/skills/opportunity/${opportunityId}`,
      { skillIds },
      getAuthConfig()
    );
    return {
      data: res?.data?.skills ?? null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: toError(err),
    };
  }
};

export const getSkillsByField = async (field) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/skills/field/${encodeURIComponent(field)}`,
      getAuthConfig()
    );
    return {
      data: res?.data?.data ?? [],
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      error: toError(err),
    };
  }
};