import { supabase } from "../config/supabaseClient.js";
import { createNotification, notifyApplicationStatusChange, createProviderNotification } from "./notificationService.js";
import { getApplicantSkills } from "./skillsService.js";

export async function applyToOpportunity({ userId, opportunityId }) {
  // 1. Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found");
  }

  // 2. Get applicant profile (including location and nqf_level for scoring)
  const { data: applicantProfile, error: applicantError } = await supabase
    .from("applicant_profiles")
    .select("id, location, nqf_level, surname")
    .eq("profile_id", profile.id)
    .single();

  if (applicantError || !applicantProfile) {
    throw new Error("Applicant profile not found");
  }

  const applicantId = applicantProfile.id;
  const applicantLocation = applicantProfile.location;
  const applicantNqf = applicantProfile.nqf_level;
  const applicantSurname = applicantProfile.surname;

  // 3. Prevent duplicate applications
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("applicant_id", applicantId)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (existing) {
    throw new Error("Already applied");
  }

  // 4. Fetch opportunity details for scoring
  const { data: opportunity, error: oppError } = await supabase
    .from("opportunities")
    .select(`
      id,
      title,
      provider_id,
      field,
      nqf_level,
      location,
      opportunity_skills ( skills_id )
    `)
    .eq("id", opportunityId)
    .single();

  if (oppError || !opportunity) {
    throw new Error("Opportunity not found");
  }

  // 5. Fetch applicant's skill IDs
  const applicantSkills = await getApplicantSkills(applicantId);
  const applicantSkillIds = applicantSkills.map(skill => skill.id);

  // 6. Calculate match score (same logic as matchingOpportunity)
  const oppSkillIds = opportunity.opportunity_skills?.map(os => os.skills_id) || [];
  const matchedSkills = oppSkillIds.filter(id => applicantSkillIds.includes(id));
  const skillMatchCount = matchedSkills.length;
  const totalOppSkills = oppSkillIds.length;
  const skillScore = totalOppSkills === 0 ? 0 : skillMatchCount / totalOppSkills;

  let locationScore = 0;
  if (opportunity.location === applicantLocation) locationScore = 1;
  else if (opportunity.location === "Remote") locationScore = 0.5;

  let nqfScore = 0;
  if (opportunity.nqf_level && applicantNqf) {
    nqfScore = Math.max(0, 1 - (applicantNqf - opportunity.nqf_level) / 10);
  }

  const totalScore = Math.round(100*(skillScore * 0.6 + locationScore * 0.2 + nqfScore * 0.2));

  // 7. Insert application with match_score
  const { data: inserted, error: insertError } = await supabase
    .from("applications")
    .insert([{
      applicant_id: applicantId,
      opportunity_id: opportunityId,
      status: "received",
      match_score: totalScore,
    }])
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);
  //console.log("Insert Application: ", inserted);
  const applicationId = inserted.id;

  // 8. Send notification including the score
  try {
    await createNotification({
      applicantId: applicantId,
      type: "application_status_change",
      title: "Application received",
      message: `Your application to "${opportunity.title}" was successfully received. Your match score: ${(totalScore).toFixed(1)}%.`,
      applicationId: applicationId,
      opportunityId: opportunityId,
      metadata: { match_score: totalScore, skill_match_count: skillMatchCount }
    });
  } catch (notificationError) {
    console.error("Failed to create notification:", notificationError);
  }

  try{
    await createProviderNotification({
      providerId: opportunity.provider_id,
      type: "application_status_change",
      title: "Application received",
      message: `You have received an application from ${applicantProfile.surname} for the "${opportunity.title}" opportunity. The applicant's match score is ${(totalScore).toFixed(1)}%.`,
      applicationId: applicationId,
      opportunityId: opportunityId,
      metadata: { match_score: totalScore, skill_match_count: skillMatchCount }
    });
  }catch(notificationProviderError){
    console.error("Failed to create provider notification:", notificationProviderError);
  }

  return inserted;
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

export async function acceptOffer({ userId, applicationId }) {
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

  // 3. Check application exists + belongs to user
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("applicant_id", applicant.id)
    .single();

  if (appError || !application) {
    throw new Error("Application not found");
  }

  // 4. Only allow accepting if status is "offered"
  if (application.status !== "offered") {
    throw new Error("Only offered applications can be accepted");
  }

  // 5. Update status → accepted
  const { data, error: updateError } = await supabase
    .from("applications")
    .update({ status: "accepted" })
    .eq("id", applicationId)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  try {
    await notifyApplicationStatusChange(applicant.id, applicationId, application.opportunity_id, "accepted");
  } catch (notificationError) {
    console.error("Failed to create notification:", notificationError);
  }


  return data;
}