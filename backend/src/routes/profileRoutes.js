import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
    getMyApplicantProfile,
    saveMyApplicantProfile,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyApplicantProfile);
router.post("/me", authMiddleware, saveMyApplicantProfile);

export default router;