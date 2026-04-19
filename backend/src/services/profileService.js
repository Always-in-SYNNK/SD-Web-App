// ============================================
// profileService.js - ONLY THIS FILE NEEDS THE FIX
// ============================================

import { supabase } from "../config/supabaseClient.js";

// ============================================
// GET APPLICANT PROFILE (KEEP AS IS)
// ============================================
export async function getApplicantProfileByUserId(userId) {
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, surname, email, role")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;

    const { data: applicantProfile, error: applicantError } = await supabase
        .from("applicant_profiles")
        .select("bio, location, nqf_level, cv_url")
        .eq("profile_id", profile.id)
        .maybeSingle();

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
            origin,
            date_obtained,
            qualifications (
                title,
                nqf_level,
                field,
                subfield
            )
        `)
        .eq("applicant_id", profile.id);

    if (qualificationsError) throw qualificationsError;

    const mappedQualifications = (qualifications || []).map((row) => ({
        id: row.id,
        name: row.qualification_id
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
        institution: row.origin,
        date_obtained: row.date_obtained,
        is_custom: !row.qualification_id,
    }));

    return {
        id: profile.id,
        full_name: profile.full_name,
        surname: profile.surname,
        email: profile.email,
        role: profile.role,
        bio: applicantProfile?.bio ?? "",
        location: applicantProfile?.location ?? "",
        nqf_level: applicantProfile?.nqf_level ?? null,
        cv_url: applicantProfile?.cv_url ?? null,
        qualifications: mappedQualifications,
    };
}

// ============================================
// SAVE APPLICANT PROFILE (KEEP AS IS)
// ============================================
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
        .update({ full_name })
        .eq("id", profile.id);
    if (updateProfileError) throw updateProfileError;

    const { data, error } = await supabase
        .from("applicant_profiles")
        .upsert(
            {
                profile_id: profile.id,
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

// ============================================
// UPLOAD CV TO SUPABASE STORAGE (FIXED - THIS WAS THE PROBLEM)
// ============================================
export async function uploadApplicantCV(userId, file) {
    // ✅ FIXED: safeName is defined BEFORE using it
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

// ============================================
// SAVE CV PATH TO DATABASE (KEEP AS IS)
// ============================================
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

// ============================================
// DELETE OLD CV (KEEP AS IS)
// ============================================
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

// ============================================
// GET SIGNED URL FOR CV (KEEP AS IS)
// ============================================
export async function getApplicantCVSignedUrl(cvPath) {
    const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(cvPath, 60 * 10);

    if (error) throw error;

    return data.signedUrl;
}

// ============================================
// ADD QUALIFICATION (KEEP AS IS)
// ============================================
export async function addApplicantQualificationByUserId(userId, payload) {
    const {
        qualification_id,
        custom_name,
        custom_nqf_level,
        custom_field,
        custom_subfield,
        status,
        institution,
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

    const qualificationRow = {
        applicant_id: profile.id,
        qualification_id: qualification_id ?? null,
        qualification_name: qualification_id ? null : custom_name,
        nqf_level: qualification_id ? null : custom_nqf_level ?? null,
        field: qualification_id ? null : custom_field ?? null,
        subfield: qualification_id ? null : custom_subfield ?? null,
        status,
        originator: institution,
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