//Calls service functions and handle request/response
import {
    getApplicantProfileByUserId,
    upsertApplicantProfileByUserId,
    uploadApplicantCV,
    saveApplicantCVPath,
    deleteApplicantCVIfExists,
} from "../services/profileService.js";

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