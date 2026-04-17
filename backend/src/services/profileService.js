import { supabase } from "../config/supabaseClient.js";

export async function getApplicantProfileByUserId(userId) {
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id", "full_name", "email", "isAdmin")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;

    const { data: applicantProfile, error: applicantError } = await supabase
        .from("applicant_profiles")
        .select("id", "bio", "location", "nqf_level")
        .eq("profile_id", profile.id)
        .single();
    if (applicantError && applicantError.code !== "PGRST116") { //PGRST116 is code for no rows found
        throw applicantError;
    }

    const { data: applicantQualifications, error: qualificationError } = await supabase
        .from("applicant_qualifications")
        .select("qualification", "status", "date_obtained", "originator")
        .eq("applicant_id", applicantProfile.id);
    if (qualificationError) throw qualificationError;

    return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        bio: applicantProfile?.bio ?? "",
        location: applicantProfile?.location ?? "",
        nqf_level: applicantProfile?.nqf_level ?? null,
        isAdmin: profile.isAdmin,
        cv_url: applicantProfile?.cv_url ?? null,
    }

}

export async function upsertApplicantProfileByUserId(userId, payload) {
    const { full_name, surname, bio, location, nqf_level, cv_url } = payload;

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
            surname,
        })
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
                cv_url,
            },
            { onConflict: "profile_id" }
        )
        .select()
        .single();
    if (error) throw error;

    return data;
}

export async function uploadApplicantCV(userId, fileBuffer, originalName, mimeType) {
    const filePath = `applicants/${userId}/${Date.now()}-${originalName}`;

    const { data, error } = await supabase.storage
        .from("cvs")
        .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: true,
        });

    if (error) throw error;

    return data.path;
}