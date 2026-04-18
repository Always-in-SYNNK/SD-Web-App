import { supabase } from "../lib/supabaseClient";

/* ─────────────────────────────────────────────
   GET ALL APPLICATIONS (JOIN WITH PROFILE)
───────────────────────────────────────────── */
export const getAdminApplications = async () => {
  const { data, error } = await supabase
    .from("admin_applications")
    .select(`
      id,
      status,
      created_at,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .eq("status", "pending");

  if (error) throw error;
  return data;
};

/* ─────────────────────────────────────────────
   APPLY FOR ADMIN
───────────────────────────────────────────── */
export const applyForAdmin = async (userId) => {
  const { error } = await supabase
    .from("admin_applications")
    .insert([{ user_id: userId }]);

  if (error) throw error;
};

/* ─────────────────────────────────────────────
   GRANT ADMIN ACCESS
───────────────────────────────────────────── */
export const grantAdminAccess = async (application) => {
  const userId = application.user_id;

  // 1. Update profile
  await supabase
    .from("profiles")
    .update({ isAdmin: true, role: "admin" })
    .eq("id", userId);

  // 2. Update application status
  await supabase
    .from("admin_applications")
    .update({ status: "approved" })
    .eq("id", application.id);
};

/* ─────────────────────────────────────────────
   REJECT
───────────────────────────────────────────── */
export const rejectAdminApplication = async (id) => {
  await supabase
    .from("admin_applications")
    .update({ status: "rejected" })
    .eq("id", id);
};