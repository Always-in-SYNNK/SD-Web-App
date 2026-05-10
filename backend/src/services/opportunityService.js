import { supabase } from "../config/supabaseClient.js";
import { createNotification } from "./notificationService.js";
import { setOpportunitySkills, getApplicantSkills } from "./skillsService.js";

function buildOpportunitySearchQuery(baseQuery, { search, location, nqfLevel, field }) {
  let query = baseQuery;

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  if (nqfLevel) {
    query = query.eq("nqf_level", nqfLevel);
  }

  if (field) {
    query = query.eq("field", field);
  }

  return query;
}

function normalizeDistinctValues(data) {
  if (!Array.isArray(data)) return [];

  return data
    .map((row) => {
      if (typeof row === "string" || typeof row === "number") {
        return String(row);
      }

      if (row && typeof row === "object") {
        const firstValue = Object.values(row)[0];
        if (firstValue !== undefined && firstValue !== null) {
          return String(firstValue);
        }
      }

      return null;
    })
    .filter(Boolean);
}

export async function getDistinctLocations() {
  const { data, error } = await supabase.rpc("opportunities_get_location");

  //console.log("RAW locations RPC data:", JSON.stringify(data, null, 2));
  if (error) throw new Error(error.message);
  return normalizeDistinctValues(data);
}

export async function getDistinctFields() {
  const { data, error } = await supabase.rpc("opportunities_get_fields");
  //console.log("RAW locations RPC data:", JSON.stringify(data, null, 2));
  if (error) throw new Error(error.message);
  return normalizeDistinctValues(data);
}

export async function getDistinctNqfLevels() {
  const { data, error } = await supabase.rpc("opportunities_get_nqf_levels");
  //console.log("RAW locations RPC data:", JSON.stringify(data, null, 2));
  if (error) throw new Error(error.message);
  return normalizeDistinctValues(data);
}

async function getQualifications({ search, nqfLevel, field }) {
  if (search) {
    const { data, error } = await supabase.rpc("search_qualifications", {
      search_term: search,
    });
    if (error) throw new Error(error.message);
    return data || [];
  }

  if (field) {
    const { data, error } = await supabase.rpc("get_qualifications_by_field", {
      field_input: field,
    });
    if (error) throw new Error(error.message);
    return data || [];
  }

  if (nqfLevel) {
    const { data, error } = await supabase.rpc("get_qualifications_by_nqf_level", {
      level_input: nqfLevel,
    });
    if (error) throw new Error(error.message);
    return data || [];
  }

  const { data, error } = await supabase.rpc("get_all_qualifications");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getFilteredOpportunitiesAndQualifications(filters = {}) {
  const {
    search = "",
    location = "",
    nqfLevel = "",
    field = "",
    page = 1,
    limit = 12,
  } = filters;

  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.max(Number(limit) || 12, 1);

  // Pull all APPROVED matching opportunities first so count reflects filtered total.
  let oppQuery = supabase
    .from("opportunities")
    .select("*", { count: "exact" })
    .eq("status", "approved");

  oppQuery = buildOpportunitySearchQuery(oppQuery, {
    search,
    location,
    nqfLevel,
    field,
  });

  oppQuery = oppQuery.order("created_at", { ascending: false });

  const from = (parsedPage - 1) * parsedLimit;
  const to = from + parsedLimit - 1;

  const { data: oppsData, error: oppsError, count } = await oppQuery.range(from, to);

  if (oppsError) throw new Error(oppsError.message);

  const qualifications = await getQualifications({ search, nqfLevel, field });

  const taggedOpps = (oppsData || []).map((o) => ({
    ...o,
    _type: "opportunity",
  }));

  const taggedQuals = (qualifications || []).map((q) => ({
    ...q,
    _type: "qualification",
  }));

  // Same behavior as your current component: combine both.
  // Note: qualifications are not paginated here.
  const combined = [...taggedOpps, ...taggedQuals];

  return {
    data: combined,
    summary: {
      opportunities: taggedOpps.length,
      qualifications: taggedQuals.length,
    },
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total: count || 0,
      totalPages: count ? Math.ceil(count / parsedLimit) : 0,
    },
  };
}


export async function createOpportunity({ userId, data, status }) {
  //The data passed into the function needs to have a skills array attached?
  // 1. Resolve profile from either auth user ID (profiles.user_id) or profile ID (profiles.id).
  let { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!profile) {
    const { data: profileById } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    profile = profileById;
  }

  if (!profile) {
    throw new Error("Profile not found for authenticated user");
  }

  const { data: provider, error: providerError } = await supabase
    .from("provider_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (providerError || !provider) {
    throw new Error("Provider profile not found");
  }

  // 2. Insert opportunity
  const { data: inserted, error } = await supabase
    .from("opportunities")
    .insert([
      {
        provider_id: provider.id,
        title: data.title,
        description: data.description,
        location: data.location,
        stipend: data.stipend ? Number(data.stipend) : null,
        nqf_level: data.nqf_level ? Number(data.nqf_level) : null,
        duration: data.duration,
        closing_date: data.closing_date || null,
        field: data.field ?? null,
        status,
      },
    ])
    .select('id')
    .single();

  if (error) throw new Error(error.message);


  // Only update skills if skillIds are provided
  if (data.skillIds && data.skillIds.length > 0) {
    const { error: skillsError } = await setOpportunitySkills(inserted.id, data.skillIds);
    if (skillsError) throw new Error(skillsError.message);
  }
  return inserted;
}

export async function updateOpportunityForProvider({ providerId, opportunityId, data }) {
  const { data: existing, error: fetchError } = await supabase
    .from("opportunities")
    .select("id, provider_id")
    .eq("id", opportunityId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existing) throw new Error("Opportunity not found");
  if (existing.provider_id !== providerId) {
    throw new Error("Not authorized to update this opportunity");
  }

  // Only touch opportunity skills when the caller explicitly sends skillIds.
  if (Object.prototype.hasOwnProperty.call(data, "skillIds")) {
    await setOpportunitySkills(opportunityId, Array.isArray(data.skillIds) ? data.skillIds : []);
  }

  const payload = {
    title: data.title,
    description: data.description,
    location: data.location,
    stipend: data.stipend ? Number(data.stipend) : null,
    nqf_level: data.nqf_level ? Number(data.nqf_level) : null,
    duration: data.duration,
    closing_date: data.closing_date || null,
    field: data.field ?? null,
    status: data.status,
  };

  const { data: updated, error: updateError } = await supabase
    .from("opportunities")
    .update(payload)
    .eq("id", opportunityId)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);


  return updated;
}

export async function getOpportunityForProvider({ providerId, opportunityId }) {
  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!opportunity) throw new Error("Opportunity not found");
  if (opportunity.provider_id !== providerId) {
    throw new Error("Not authorized to view this opportunity");
  }

  return opportunity;
}

// admin functions
export const getOpportunitiesByStatus = async (status) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getPending = async () => getOpportunitiesByStatus("pending");

export const getApproved = async () => getOpportunitiesByStatus("approved");

export const updateStatus = async (id, status) => {
  const { error } = await supabase
    .from("opportunities")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
};

export const deleteOpportunityById = async (id) => {
  const { error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export async function matchingOpportunity(userId) {
  //1. Get profile ID from userID
  const { data: profile, profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (profileError) throw profileError;

  //2. Get applicant profile (location, NQF Level)
  const { data: applicantProfile, applicantError } = await supabase
    .from("applicant_profiles")
    .select("location, nqf_level")
    .eq("profile_id", profile.id)
    .single();
  if (applicantError) throw applicantError;

  const applicantLocation = applicantProfile.location;
  const applicantNqf = applicantProfile.nqf_level;

  // 3. Get distinct fields the applicant has skills in (as array of strings)
  const { data: fields, fieldsError } = await supabase.rpc("get_applicant_skill_fields_array", { applicant_id_param: profile.id });
  if (fieldsError) throw fieldsError;

  // 4. Get detailed applicant skills (with IDs and fields)
  const { data: applicantSkills, skillsError } = await getApplicantSkills(applicantProfile.id);
  if (skillsError) throw skillsError;

  const applicantSkillIds = applicantSkills.map(skill => skill.id);

  // 5. Build opportunity query
  let query = supabase
    .from("opportunities")
    .select(`*, opportunity_skills(skills_id)`)
    .eq("status", "approved")
    .in("field", fields)
    .in("nqf_level", [null, ...Array.from({ length: applicantNqf }, (_, i) => i + 1)])
    .or(`location.eq.${applicantLocation},location.eq.Remote`);

  const { data: opportunities, queryError } = await query;
  if (queryError) throw queryError;

  //6. Filter opportunities that have at least one matching skill
  const matched = opportunities.filter(opp => {
    const oppSkillIds = opp.opportunity_skills?.map(os => os.skills_id) || [];
    return oppSkillIds.some(id => applicantSkillIds.includes(id));
  });

  // 7. Calculate a score for each opportunity (more matches = higher score)
  const scored = matched.map(opp => {
    const oppSkillIds = opp.opportunity_skills?.map(os => os.skills_id) || [];
    const matchedSkills = oppSkillIds.filter(id => applicantSkillIds.includes(id));
    const skillMatchCount = matchedSkills.length;
    const totalOppSkills = oppSkillIds.length;
    const skillScore = totalOppSkills === 0 ? 0 : skillMatchCount / totalOppSkills;

    // Additional score factors (you can adjust weights)
    let locationScore = 0;
    if (opp.location === applicantLocation) locationScore = 1;
    else if (opp.location === "Remote") locationScore = 0.5;

    let nqfScore = 0;
    if (opp.nqf_level && applicantNqf) {
      nqfScore = Math.max(0, 1 - (applicantNqf - opp.nqf_level) / 10); // higher if close or equal
    }

    const totalScore = skillScore * 0.6 + locationScore * 0.2 + nqfScore * 0.2;

    return { ...opp, score: totalScore, skillMatchCount };
  });

  // 8. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored;


}