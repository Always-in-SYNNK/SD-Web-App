import { supabase } from "../config/supabaseClient.js";

export const getMyApplicationStatus = async (profileId) => {
  const { data, error } = await supabase
    .from("admin_applications")
    .select("status, created_at")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data || null;
};

export const createApplication = async (profileId) => {
  // prevent duplicates
  const { data: existing } = await supabase
    .from("admin_applications")
    .select("id")
    .eq("user_id", profileId)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (existing) {
    throw new Error("Already applied or already admin");
  }

  const { error } = await supabase
    .from("admin_applications")
    .insert([{ user_id: profileId }]);

  if (error) throw error;
};

export const fetchApplications = async () => {
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
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

export const approveApplication = async (applicationId) => {
  // get application - need the user id to grant admin later
  const { data: app, error: fetchError } = await supabase
    .from("admin_applications")
    .select("user_id")
    .eq("id", applicationId)
    .single();

  if (fetchError) throw fetchError;

  // update application
  await supabase
    .from("admin_applications")
    .update({ status: "approved" })
    .eq("id", applicationId);

  // grant admin
  await supabase
    .from("profiles")
    .update({ isAdmin: true })
    .eq("id", app.user_id);
};

export const rejectApplication = async (applicationId) => {
  const { error } = await supabase
    .from("admin_applications")
    .update({ status: "rejected" })
    .eq("id", applicationId);

  if (error) throw error;
};