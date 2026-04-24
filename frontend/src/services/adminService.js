// src/services/adminService.js
import { supabase } from "../lib/supabaseClient";

/* ─────────────────────────────────────────────
   GET ALL PENDING APPLICATIONS
───────────────────────────────────────────── */
export const getAdminApplications = async () => {
  const { data, error } = await supabase
    .from("admin_applications")
    .select(`
      id,
      status,
      created_at,
      user_id,
      profiles (
        id,
        full_name,
        email,
        role
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

/* ─────────────────────────────────────────────
   APPLY FOR ADMIN
───────────────────────────────────────────── */
export const applyForAdmin = async (profilesId) => {
  const { data: existing } = await supabase
    .from("admin_applications")
    .select("id, status")
    .eq("user_id", profilesId)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (existing) return; // already applied

  const { error } = await supabase
    .from("admin_applications")
    .insert([{ user_id: profilesId }]);

  if (error) throw error;
};

/* ─────────────────────────────────────────────
   GRANT ADMIN ACCESS
   Uses RPC so the SECURITY DEFINER function
   handles the profiles UPDATE with elevated
   privileges (bypasses any future RLS).
   
   The function also does the application status
   update internally — one atomic operation.
───────────────────────────────────────────── */
export const grantAdminAccess = async (application) => {
  const { error } = await supabase.rpc("grant_admin_access", {
    target_user_id: application.user_id,
  });

  if (error) {
    console.error("grantAdminAccess RPC error:", error);
    throw error;
  }
};

/* ─────────────────────────────────────────────
   REJECT APPLICATION
───────────────────────────────────────────── */
export const rejectAdminApplication = async (applicationId) => {
  const { error } = await supabase.rpc("reject_admin_application", {
    target_application_id: applicationId,
  });

  if (error) {
    console.error("rejectAdminApplication RPC error:", error);
    throw error;
  }
};