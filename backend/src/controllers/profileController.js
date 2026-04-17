//Calls service functions and handle request/response
import {
    getApplicantProfileByUserId,
    upsertApplicantProfileByUserId,
    uploadApplicantCV
} from "../services/profileService.js";

export async function getMyApplicantProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const data = getApplicantProfileByUserId(userId);
        res.json({ success: true, profile: data });
    } catch (error) {
        next(error);
    }
}

export async function saveMyApplicantProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const data = await upsertApplicantProfileByUserId(userId, req.body);
        res.json({ success: true, applicant_profile: data });
    } catch (error) {
        next(error);
    }
}

export async function uploadMyApplicantCV(req, res, next) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const cvPath = await uploadApplicantCV(
      userId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    await upsertApplicantProfileByUserId(userId, {
      ...req.body,
      cv_url: cvPath,
    });

    res.json({ success: true, cv_url: cvPath });
  } catch (error) {
    next(error);
  }
}