import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import providerAuthMiddleware from "../middleware/providerAuthMiddleware.js";
import { uploadCV } from "../middleware/uploadMiddleware.js";
import {
    getMyApplicantProfile,
    getApplicantProfileById,
    saveMyApplicantProfile,
    uploadMyApplicantCV,
    getSignedCVUrl,
    addMyQualification, 
    getMyQualifications, 
    deleteMyQualification,
    getProviderProfile,
    updateProviderProfile
} from "../controllers/profileController.js";

const router = express.Router();

//applicant profile routes
router.get("/me", authMiddleware, getMyApplicantProfile);
router.get("/:applicantProfileId", providerAuthMiddleware, getApplicantProfileById);
router.post("/me", authMiddleware, saveMyApplicantProfile);
router.post("/me/cv", authMiddleware, uploadCV.single("cv"), uploadMyApplicantCV);
router.get("/me/cv/signed-url", authMiddleware, getSignedCVUrl);

router.get("/me/qualifications", authMiddleware, getMyQualifications);
router.post("/me/qualifications", authMiddleware, addMyQualification);
router.delete("/me/qualifications/:id", authMiddleware, deleteMyQualification);

//provider profile routes
router.get("/provider/me", providerAuthMiddleware, getProviderProfile);
router.put("/provider/me", providerAuthMiddleware, updateProviderProfile);

export default router;
