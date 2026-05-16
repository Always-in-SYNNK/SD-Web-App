//NEW ADMIN SERVICE TO ABSTRACT API CALLS FOR ADMIN APPLICATIONS

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseErrorMessage = async (res, fallback) => {
  try {
    const data = await res.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
};

/* APPLY */
export const applyForAdmin = async () => {
  const res = await fetch(`${API_URL}/api/admin/apply`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to apply"));
  }
};

/* CHECK CURRENT USER STATUS */
export const getMyAdminApplicationStatus = async () => {
  const res = await fetch(`${API_URL}/api/admin/me/application-status`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to fetch application status"));
  }

  return res.json();
};



/* GET ALL ADMIN APPLICATIONS */
export const getAdminApplications = async () => {
  const res = await fetch(`${API_URL}/api/admin/applications`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to fetch"));
  }

  return res.json();
};

/* APPROVE */
export const grantAdminAccess = async (id) => {
  const res = await fetch(`${API_URL}/api/admin/${id}/approve`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to approve"));
  }
};

/* REJECT */
export const rejectAdminApplication = async (id) => {
  const res = await fetch(`${API_URL}/api/admin/${id}/reject`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to reject"));
  }
};

/* GET ADMIN OPPORTUNITY STATS */
export const getAdminStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/admin-stats`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Failed to fetch admin opportunity stats"));
  }

  return res.json();
};