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
        status: "applied",
      },
    ])
    .select();

  if (error) throw new Error(error.message);

  return data;
}