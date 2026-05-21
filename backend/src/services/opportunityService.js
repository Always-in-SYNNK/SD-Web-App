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

  if (error) throw new Error(error.message);
  return normalizeDistinctValues(data);
}

export async function getDistinctFields() {
  const { data, error } = await supabase.rpc("opportunities_get_fields");
  if (error) throw new Error(error.message);
  return normalizeDistinctValues(data);
}

export async function getDistinctNqfLevels() {
  const { data, error } = await supabase.rpc("opportunities_get_nqf_levels");
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
    .select(`
      *,
      provider_profiles (
        id,
        profile_id
      )
    `)
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
  //console.log("User ID:", userId);

  // 1. Get profile ID from userID
  const { data: profile, profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (profileError) throw profileError;

  // 2. Get applicant profile (location, NQF Level)
  const { data: applicantProfile, applicantError } = await supabase
    .from("applicant_profiles")
    .select("id, location, nqf_level")
    .eq("profile_id", profile.id)
    .single();
  if (applicantError) throw applicantError;

  const applicantLocation = applicantProfile.location;
  const applicantNqf = applicantProfile.nqf_level;
  //console.log("Applicant ID:", applicantProfile.id);
  //console.log("Applicant Location:", applicantLocation);
  //console.log("Applicant NQF:", applicantNqf);

  // 3. Get distinct fields the applicant has skills in
  const { data: fields, fieldsError } = await supabase.rpc("get_applicant_skill_fields_array",
    { applicant_id_param: applicantProfile.id }
  );
  if (fieldsError) throw fieldsError;

  let rawFieldArray = [];
  if (fields && Array.isArray(fields)) {
    rawFieldArray = fields;
  } else if (fields && typeof fields === 'string') {
    rawFieldArray = [fields];
  }

  const cleanFieldForMatching = (field) => {
    if (!field) return '';
    let cleaned = field.replace(/^Field \d+ - /, '');
    cleaned = cleaned.replace(/^Field - /, '');
    cleaned = cleaned.trim();
    return cleaned;
  };

  const fieldArray = rawFieldArray.map(cleanFieldForMatching).filter(f => f !== '');
  //console.log("Cleaned fields:", fieldArray);

  // 4. Get detailed applicant skills
  const applicantSkills = await getApplicantSkills(applicantProfile.id);

  if (!applicantSkills || applicantSkills.length === 0) {
    //console.log("No skills found for applicant");
    return [];
  }

  const applicantSkillIds = applicantSkills.map(skill => skill.id);
  //console.log("Applicant skill IDs:", applicantSkillIds.length);

  // 5. Build NQF levels array
  const nqfLevels = [];
  if (applicantNqf && applicantNqf > 0) {
    for (let i = 1; i <= applicantNqf; i++) {
      nqfLevels.push(i);
    }
    if (applicantNqf < 10) {
      nqfLevels.push(applicantNqf + 1);
    }
  }
  //console.log("NQF Levels:", nqfLevels);

  if (fieldArray.length === 0) {
    //console.log("No fields found for applicant, cannot match opportunities");
    return [];
  }

  // FIX: Build OR conditions properly with escaped field names
  // Use a different approach - try each field individually
  let opportunities = [];

  // Try to find opportunities for each field
  for (const field of fieldArray) {
    //console.log(`Searching for field: "${field}"`);

    let query = supabase
      .from("opportunities")
      .select(`*, opportunity_skills(skills_id)`)
      .eq("status", "approved")
      .ilike("field", `%${field}%`);

    const { data: fieldMatches, error: fieldError } = await query;
    if (!fieldError && fieldMatches && fieldMatches.length > 0) {
      //console.log(`Found ${fieldMatches.length} opportunities for field "${field}"`);
      opportunities.push(...fieldMatches);
    }
  }

  // Remove duplicates based on opportunity ID
  const uniqueOpportunities = [];
  const seenIds = new Set();
  for (const opp of opportunities) {
    if (!seenIds.has(opp.id)) {
      seenIds.add(opp.id);
      uniqueOpportunities.push(opp);
    }
  }

  opportunities = uniqueOpportunities;
  //console.log(`Total unique opportunities from all fields: ${opportunities.length}`);

  if (opportunities.length === 0) {
    //console.log("No opportunities found with matching fields");
    return [];
  }

  // Apply NQF and location filters in JavaScript instead of SQL
  const filteredByNqfAndLocation = opportunities.filter(opp => {
    // Check NQF level (if specified)
    let nqfMatch = true;
    if (opp.nqf_level && nqfLevels.length > 0) {
      nqfMatch = nqfLevels.includes(opp.nqf_level);
    }

    // Check location
    let locationMatch = true;
    if (applicantLocation) {
      locationMatch = (opp.location === applicantLocation || opp.location === "Remote");
    }

    return nqfMatch && locationMatch;
  });

  //console.log(`After NQF and location filter: ${filteredByNqfAndLocation.length}`);

  if (filteredByNqfAndLocation.length === 0) {
    //console.log("No opportunities after NQF/location filter, returning all field matches");
    // Fall back to all opportunities that matched fields
    return opportunities;
  }

  // Filter by skill match
  const matched = filteredByNqfAndLocation.filter(opp => {
    const oppSkillIds = opp.opportunity_skills?.map(os => os.skills_id) || [];
    const hasMatchingSkill = oppSkillIds.some(id => applicantSkillIds.includes(id));
    return hasMatchingSkill;
  });

  //console.log(`Found ${matched.length} opportunities with matching skills`);

  if (matched.length === 0) {
    return [];
  }

  // Calculate scores
  const scored = matched.map(opp => {
    const oppSkillIds = opp.opportunity_skills?.map(os => os.skills_id) || [];
    const matchedSkills = oppSkillIds.filter(id => applicantSkillIds.includes(id));
    const skillMatchCount = matchedSkills.length;
    const totalOppSkills = oppSkillIds.length;
    const skillScore = totalOppSkills === 0 ? 0 : skillMatchCount / totalOppSkills;

    let locationScore = 0;
    if (opp.location === applicantLocation) locationScore = 1;
    else if (opp.location === "Remote") locationScore = 0.5;
    else locationScore = 0.2;

    let nqfScore = 0;
    if (opp.nqf_level && applicantNqf) {
      const nqfDiff = Math.abs(applicantNqf - opp.nqf_level);
      nqfScore = Math.max(0, 1 - (nqfDiff / 10));
    } else if (!opp.nqf_level) {
      nqfScore = 0.5;
    }

    const totalScore = (skillScore * 0.6) + (locationScore * 0.2) + (nqfScore * 0.2);

    return {
      ...opp,
      score: totalScore,
      skillMatchCount
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const MATCH_THRESHOLD = 0.7; // Lower threshold to see matches
  const filtered = scored.filter(o => o.score >= MATCH_THRESHOLD);

  //console.log(`Found ${filtered.length} opportunities with score >= ${MATCH_THRESHOLD * 100}%`);

  if (filtered.length > 0) {
    console.log("Top matches:", filtered.slice(0, 3).map(o => ({
      title: o.title,
      field: o.field,
      score: o.score,
      location: o.location,
      nqf_level: o.nqf_level
    })));
  }

  return filtered;
}
// ✅ NEW FUNCTION at the end of the file
export const getOpportunityById = async (id) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select("id, title, description, provider_id, status, created_at, location, stipend, duration, closing_date, nqf_level, field")
    .eq("id", id)
    .single();

  if (error) {
    // Return null only for "not found" case; throw on real DB errors
    if (error.message && error.message.includes('No rows found')) {
      return null;
    }
    throw new Error(`Failed to fetch opportunity: ${error.message}`);
  }

  return data;
};
