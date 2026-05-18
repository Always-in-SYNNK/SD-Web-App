//Calls service functions and handle request/response
import {
    getApplicantProfileByUserId,
    getApplicantProfileByProfileId,
    upsertApplicantProfileByUserId,
    uploadApplicantCV,
    saveApplicantCVPath,
    deleteApplicantCVIfExists,
    addApplicantQualificationByUserId,
    getApplicantCVSignedUrl,
    fetchProviderProfileByUserId,
    editProviderProfile,
} from "../services/profileService.js";
import { supabase } from "../config/supabaseClient.js";

export async function getMyApplicantProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const data = await getApplicantProfileByUserId(userId);
        res.json({ success: true, profile: data });
    } catch (error) {
        console.error("getMyApplicantProfile failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

export async function saveMyApplicantProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const data = await upsertApplicantProfileByUserId(userId, req.body);
        res.json({ success: true, applicant_profile: data });
    } catch (error) {
        console.error("getMyApplicantProfile failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

export async function uploadMyApplicantCV(req, res, next) {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        await deleteApplicantCVIfExists(userId);

        const cvPath = await uploadApplicantCV(userId, req.file);
        await saveApplicantCVPath(userId, cvPath);

        // await upsertApplicantProfileByUserId(userId, {
        //     ...req.body,
        //     cv_url: cvPath,
        // });

        res.json({
            success: true,
            cv_url: cvPath,
            message: "CV uploaded successfully.",
        });
    } catch (error) {
        console.error("getMyApplicantProfile failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

export async function getMyQualifications(req, res, next) {
    try {
        const userId = req.user.id;
        const data = await getApplicantProfileByUserId(userId);
        res.json({ success: true, qualifications: data.qualifications });
    } catch (error) { next(error); }
}

export async function addMyQualification(req, res, next) {
    try {
        const userId = req.user.id;
        const data = await addApplicantQualificationByUserId(userId, req.body);
        res.status(201).json({ success: true, qualification: data });
    } catch (error) { next(error); }
}

export async function deleteMyQualification(req, res, next) {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from("applicant_qualifications")
            .delete()
            .eq("id", id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) { next(error); }
}

export async function getSignedCVUrl(req, res, next) {
  try {
    const userId = req.user.id;
    const { data: profile } = await supabase
      .from("profiles").select("id").eq("user_id", userId).single();
    const { data: applicantProfile } = await supabase
      .from("applicant_profiles").select("cv_url").eq("profile_id", profile.id).single();

    if (!applicantProfile?.cv_url) {
      return res.json({ success: true, signed_url: null });
    }

    const signedUrl = await getApplicantCVSignedUrl(applicantProfile.cv_url);
    res.json({ success: true, signed_url: signedUrl });
  } catch (error) {
    next(error);
  }
}

export async function getApplicantProfileById(req, res, next) {
    try {
        const { applicantProfileId } = req.params;

        if (!applicantProfileId) {
            return res.status(400).json({ success: false, error: "Applicant profile ID is required" });
        }

        const profile = await getApplicantProfileByProfileId(applicantProfileId);
        res.json({ success: true, profile });
    } catch (error) {
        console.error("getApplicantProfileById failed:", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack,
        });
        next(error);
    }
}

// PROVIDER PROFILE 
export async function getProviderProfile(req, res) {
  try {
    const providerProfileId = req.user.id;

    const profile = await fetchProviderProfileByUserId(providerProfileId);

    if (!profile) {
      return res.status(404).json({
        error: "Provider profile not found",
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updateProviderProfile(req, res) {
  try {
    const providerProfileId = req.user.id;

    const updatedProfile = await editProviderProfile(
      providerProfileId,
      req.body
    );

    return res.status(200).json(updatedProfile);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to update profile",
    });
  }
}