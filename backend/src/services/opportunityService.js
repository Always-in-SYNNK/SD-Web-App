import { supabase } from "../config/supabaseClient.js";

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

  // Pull all matching opportunities first so count reflects filtered total.
  let oppQuery = supabase.from("opportunities").select("*", { count: "exact" });

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
