import { supabase } from "../config/supabaseClient.js";

export async function getSkillsByField(fieldName) {
    const { data, error } = await supabase.rpc("get_skills_by_field", {
        field_input: fieldName
    });
    if (error) throw new Error(error.message);

    return data;
}

export async function getApplicantSkills(applicantId) {
    const { data, error } = await supabase
        .from("applicant_skills")
        .select(`
            id,
            applicant_id,
            skills_id,
            skills:skills_id (
                id,
                name,
                field
            )
        `)
        .eq("applicant_id", applicantId);

    if (error) throw new Error(error.message);

    // console.log("Raw data from Supabase:", JSON.stringify(data, null, 2));
    // console.log("Is data an array?", Array.isArray(data));
    // console.log("Data length:", data?.length);

    if (!data || data.length === 0) {
        console.log("No data found, returning empty array");
        return [];
    }

    const mapped = data.map((row) => {
        return {
            id: row.skills?.id ?? row.skills_id,
            skills_id: row.skills_id,
            name: row.skills?.name ?? null,
            field: row.skills?.field ?? null,
        };
    });

    //console.log("Mapped result:", mapped);
    return mapped;
}

export async function getOpportunitySkills(opportunityId) {
    // Fix: 
    // 1. Wrong function name (was get_applicant_skills_json, should be get_opportunity_skills_json)
    // 2. Pass parameter as object, not directly
    const { data, error } = await supabase.rpc("get_opportunity_skills_json", {
        opportunity_id_param: opportunityId
    });
    if (error) throw new Error(error.message);

    return data;
}

// Called from profileService.upsertApplicantProfileByUserId to update the applicant skills
export async function setApplicantSkills(applicantId, skillIds) {
    if (!applicantId) {
        throw new Error("Applicant ID is required");
    }

    if (!skillIds || !Array.isArray(skillIds)) {
        throw new Error("Skill IDs must be provided as an array");
    }

    // 1. Delete all existing skills for this applicant
    const { error: deleteError } = await supabase
        .from("applicant_skills")
        .delete()
        .eq("applicant_id", applicantId);

    if (deleteError) {
        throw new Error(`Failed to delete existing skills: ${deleteError.message}`);
    }

    // 2. If no new skills to add, return early
    if (skillIds.length === 0) {
        return { success: true, message: "All skills removed", count: 0 };
    }

    // 3. Prepare the insert data
    const skillsToInsert = skillIds.map((skillId) => ({
        applicant_id: applicantId,
        skills_id: skillId,
    }));

    // 4. Insert new skills
    const { data, error: insertError } = await supabase
        .from("applicant_skills")
        .insert(skillsToInsert)
        .select();

    if (insertError) {
        throw new Error(`Failed to insert skills: ${insertError.message}`);
    }

    return {
        success: true,
        message: `Successfully updated ${data.length} skills`,
        count: data.length,
        skills: data,
    };
}

export async function setOpportunitySkills(opportunityId, skillIds) {
    if (!opportunityId) {
        throw new Error("Opportunity ID is required");
    }

    if (!skillIds || !Array.isArray(skillIds)) {
        throw new Error("Skill IDs must be provided as an array");
    }

    // 1. Delete all existing skills for this opportunity
    const { error: deleteError } = await supabase
        .from("opportunity_skills")
        .delete()
        .eq("opportunity_id", opportunityId);

    if (deleteError) {
        throw new Error(`Failed to delete existing skills: ${deleteError.message}`);
    }

    // 2. If no new skills to add, return early
    if (skillIds.length === 0) {
        return { success: true, message: "All skills removed", count: 0 };
    }

    // 3. Prepare the insert data
    const skillsToInsert = skillIds.map((skillId) => ({
        opportunity_id: opportunityId,
        skills_id: skillId,
    }));

    // 4. Insert new skills
    const { data, error: insertError } = await supabase
        .from("opportunity_skills")
        .insert(skillsToInsert)
        .select();

    if (insertError) {
        throw new Error(`Failed to insert skills: ${insertError.message}`);
    }

    return {
        success: true,
        message: `Successfully updated ${data.length} skills`,
        count: data.length,
        skills: data,
    };
}