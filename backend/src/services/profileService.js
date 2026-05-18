import { supabase } from "../config/supabaseClient.js";
import { getApplicantSkills } from "./skillsService.js";

export async function getApplicantProfileByUserId(userId) {
    // 1. Get base profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;
    

    // 2. Get applicant-specific data
    const { data: applicantProfile, error: applicantError } = await supabase
        .from("applicant_profiles")
        .select("id, name, surname, bio, location, nqf_level, cv_url")
        .eq("profile_id", profile.id)
        .maybeSingle();

    if (applicantError) throw applicantError;

    // 3. Get qualifications
    let qualifications = [];

    if (applicantProfile) {
        const { data, error: qualificationsError } = await supabase
            .from("applicant_qualifications")
            .select(`
              id,
              qualification_id,
              qualification_name,
              nqf_level,
              field,
              subfield,
              status,
              originator,
              date_obtained,
              qualifications (
                title,
                nqf_level,
                field,
                subfield
              )
            `)
            .eq("applicant_id", applicantProfile.id);

        if (qualificationsError) throw qualificationsError;
        qualifications = data || [];
    }

    // 4. Normalize qualifications
    const mappedQualifications = qualifications.map((row) => ({
        id: row.id,
        qualification_id: row.qualification_id,
        title: row.qualification_id
            ? row.qualifications?.title
            : row.qualification_name,
        nqf_level: row.qualification_id
            ? row.qualifications?.nqf_level
            : row.nqf_level,
        field: row.qualification_id
            ? row.qualifications?.field
            : row.field,
        subfield: row.qualification_id
            ? row.qualifications?.subfield
            : row.subfield,
        status: row.status,
        originator: row.originator ?? null,
        date_obtained: row.date_obtained,
    }));

    //Get Applicant skills
    const { data: applicantSkills, error} = await getApplicantSkills(applicantProfile.id);
    if(error) throw new Error(error.message);

    // 5. Return unified profile object
    return {
        user_id: userId,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        applicant_profile_id: applicantProfile?.id ?? null,
        bio: applicantProfile?.bio ?? "",
        location: applicantProfile?.location ?? "",
        nqf_level: applicantProfile?.nqf_level ?? null,
        surname: applicantProfile?.surname ?? "",
        cv_url: applicantProfile?.cv_url ?? null,
        qualifications: mappedQualifications,
        skills: applicantSkills ?? null,
    };
}

export async function upsertApplicantProfileByUserId(userId, payload) {
    const { full_name, surname, bio, location, nqf_level } = payload;

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;

    const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
            full_name,
        })
        .eq("id", profile.id);
    if (updateProfileError) throw updateProfileError;

    const { data, error } = await supabase
        .from("applicant_profiles")
        .upsert(
            {
                profile_id: profile.id,
                surname,
                bio,
                location,
                nqf_level,
            },
            { onConflict: "profile_id" }
        )
        .select()
        .single();
    if (error) throw error;

    return data;
}

//Upload CV to Supabase Storage
export async function uploadApplicantCV(userId, file) {
    if (!file) {
        throw new Error("No file provided.");
    }

    const safeName = file.originalname.replace(/\s+/g, "_");
    const filePath = `applicants/${userId}/${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
        .from("cvs")
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });

    if (error) throw error;

    return data.path;
}

//Handles first-time insert or update
export async function saveApplicantCVPath(userId, cvPath) {
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;

    const { data, error } = await supabase
        .from("applicant_profiles")
        .upsert(
            {
                profile_id: profile.id,
                cv_url: cvPath,
            },
            { onConflict: "profile_id" }
        )
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function deleteApplicantCVIfExists(userId) {
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;

    const { data: applicantProfile, error: applicantError } = await supabase
        .from("applicant_profiles")
        .select("cv_url")
        .eq("profile_id", profile.id)
        .maybeSingle();

    if (applicantError) throw applicantError;

    if (!applicantProfile?.cv_url) return null;

    const { error: storageError } = await supabase.storage
        .from("cvs")
        .remove([applicantProfile.cv_url]);

    if (storageError) throw storageError;

    return applicantProfile.cv_url;
}

//Later stage, for viewing CVs
export async function getApplicantCVSignedUrl(cvPath) {
    const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(cvPath, 60 * 10);

    if (error) throw error;

    return data.signedUrl;
}//Need to create an endpoint to use this

export async function addApplicantQualificationByUserId(userId, payload) {
    const {
        qualification_id,
        custom_name,
        custom_nqf_level,
        custom_field,
        custom_subfield,
        status,
        originator,
        date_obtained,
    } = payload;

    if (!qualification_id && !custom_name) {
        throw new Error("Either qualification_id or custom_name must be provided.");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;

    const { data: applicantProfile, error: applicantError } = await supabase
        .from("applicant_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    if (applicantError) throw applicantError;

    const qualificationRow = {
        applicant_id: applicantProfile.id,
        qualification_id: qualification_id ?? null,
        qualification_name: qualification_id ? null : custom_name,
        nqf_level: qualification_id ? null : custom_nqf_level ?? null,
        field: qualification_id ? null : custom_field ?? null,
        subfield: qualification_id ? null : custom_subfield ?? null,
        status,
        originator,
        date_obtained,
    };

    const { data, error } = await supabase
        .from("applicant_qualifications")
        .insert(qualificationRow)
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function getApplicantProfileByProfileId(applicantProfileId) {
    const { data: applicantProfile, error: applicantError } = await supabase
        .from("applicant_profiles")
        .select(`
            id,
            name,
            surname,
            bio,
            location,
            nqf_level,
            cv_url,
            profiles!inner (
                id,
                full_name,
                email,
                role
            )
        `)
        .eq("id", applicantProfileId)
        .single();

    if (applicantError) throw applicantError;

    const { data: qualifications, error: qualificationsError } = await supabase
        .from("applicant_qualifications")
        .select(`
            id,
            qualification_id,
            qualification_name,
            nqf_level,
            field,
            subfield,
            status,
            originator,
            date_obtained,
            qualifications (
                title,
                nqf_level,
                field,
                subfield
            )
        `)
        .eq("applicant_id", applicantProfileId);

    if (qualificationsError) throw qualificationsError;

    const mappedQualifications = (qualifications || []).map((row) => ({
        id: row.id,
        qualification_id: row.qualification_id,
        title: row.qualification_id
            ? row.qualifications?.title
            : row.qualification_name,
        nqf_level: row.qualification_id
            ? row.qualifications?.nqf_level
            : row.nqf_level,
        field: row.qualification_id
            ? row.qualifications?.field
            : row.field,
        subfield: row.qualification_id
            ? row.qualifications?.subfield
            : row.subfield,
        status: row.status,
        originator: row.originator ?? null,
        date_obtained: row.date_obtained,
    }));

    return {
        applicant_profile_id: applicantProfile.id,
        full_name: applicantProfile.profiles.full_name,
        surname: applicantProfile.surname ?? "",
        email: applicantProfile.profiles.email,
        role: applicantProfile.profiles.role,
        bio: applicantProfile.bio ?? "",
        location: applicantProfile.location ?? "",
        nqf_level: applicantProfile.nqf_level ?? null,
        cv_url: applicantProfile.cv_url ?? null,
        qualifications: mappedQualifications,
    };
}

// PROVIDER PROFILE

const FIELDS = [
  "Human and Social Studies",
  "Physical, Mathematical, Computer and Life Sciences",
  "Law, Military Science and Security",
  "Culture and Arts",
  "Manufacturing, Engineering and Technology",
  "Services",
  "Health Sciences and Social Services",
  "Business, Commerce and Management Studies",
  "Physical Planning and Construction",
  "Agriculture and Nature Conservation",
  "Education, Training and Development",
  "Communication Studies and Language",
];

function normalizeProviderProfile(profile) {
    if (!profile) return null;

    const providerProfiles = profile.provider_profiles;
    const providerProfile = Array.isArray(providerProfiles)
        ? (providerProfiles[0] ?? null)
        : providerProfiles ?? null;

    return {
        ...profile,
        provider_profiles: providerProfile,
    };
}

async function fetchProviderProfileRecord(identity) {

    const { data, error } = await supabase
        .from("profiles")
        .select(`
            id,
            user_id,
            full_name,
            email,
            role,
            provider_profiles (
                id,
                organisation_name,
                organisation_type,
                focus_fields,
                description,
                location,
                website_url
            )
        `)
        .eq("role", "provider")
        .or(`id.eq.${identity},user_id.eq.${identity}`)
        .single();

    if (error) throw error;

    return normalizeProviderProfile(data);
}

export async function fetchProviderProfileByUserId(userId) {
    return fetchProviderProfileRecord(userId);
}

export async function editProviderProfile(userId, updates) {
    const profile = await fetchProviderProfileRecord(userId);

    if (!profile) throw new Error("Provider profile not found");

    // 1. Update base profile (full_name lives on profiles table)
    if (updates.full_name !== undefined) {
        const { error: profileError } = await supabase
            .from("profiles")
            .update({ full_name: updates.full_name })
            .eq("id", profile.id);

        if (profileError) throw profileError;
    }

    // 2. Upsert provider_profiles row so first-time saves work too
    const providerUpdates = {
        profile_id: profile.id,
    };
    if (updates.organisation_name !== undefined) providerUpdates.organisation_name = updates.organisation_name;
    if (updates.organisation_type !== undefined) providerUpdates.organisation_type = updates.organisation_type;
    if (updates.focus_fields !== undefined) {

        if (!Array.isArray(updates.focus_fields)) {
            throw new Error("focus_fields must be an array");
        }

        const invalidFields = updates.focus_fields.filter(
            (field) => !FIELDS.includes(field)
        );

        if (invalidFields.length > 0) {
            throw new Error("Invalid focus fields provided");
        }

        providerUpdates.focus_fields = updates.focus_fields;
    }

    if (updates.description  !== undefined) providerUpdates.description  = updates.description;
    if (updates.location     !== undefined) providerUpdates.location     = updates.location; 
    if (updates.website_url  !== undefined) providerUpdates.website_url  = updates.website_url; 

    if (Object.keys(providerUpdates).length > 1) {
        const { error: providerError } = await supabase
            .from("provider_profiles")
            .upsert(providerUpdates, { onConflict: "profile_id" });

        if (providerError) throw providerError;
    }

    // 3. Return fresh data
    return fetchProviderProfileRecord(userId);
}