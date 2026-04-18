import { supabase } from "../config/supabaseClient.js";

export async function applyToOpportunity({ userId, opportunityId }) {
  // 1. Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found");
  }

  // 2. Get applicant profile
  const { data: applicantProfile, error: applicantError } = await supabase
    .from("applicant_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (applicantError || !applicantProfile) {
    throw new Error("Applicant profile not found");
  }

  const applicantId = applicantProfile.id;

  // 3. Prevent duplicates (optional but recommended)
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("applicant_id", applicantId)
    .eq("opportunity_id", opportunityId)
    .single();

  if (existing) {
    throw new Error("Already applied");
  }

  // 4. Insert
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        applicant_id: applicantId,
        opportunity_id: opportunityId,
        status: "received",
      },
    ])
    .select();

  if (error) throw new Error(error.message);

  return data;
}

export async function getApplicationsForUser(userId) {
  // 1. Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found");
  }

  // 2. Get applicant profile
  const { data: applicant, error: applicantError } = await supabase
    .from("applicant_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (applicantError || !applicant) {
    throw new Error("Applicant profile not found");
  }

  // 3. Get applications + JOIN opportunities
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      created_at,
      opportunities (
        id,
        title,
        location,
        closing_date,
        provider_profiles!opportunities_provider_id_fkey (
          organisation_name
        )
      )
    `)
    .eq("applicant_id", applicant.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteApplicationForUser({ userId, applicationId }) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found");
  }

  const { data: applicant, error: applicantError } = await supabase
    .from("applicant_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (applicantError || !applicant) {
    throw new Error("Applicant profile not found");
  }

  const { data: existing, error: existingError } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("applicant_id", applicant.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existing) {
    throw new Error("Application not found");
  }

  const { error: deleteError } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("applicant_id", applicant.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}