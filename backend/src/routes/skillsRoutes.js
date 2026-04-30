import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getSkills,
    getApplicant,
    getOppSkills,
    setAppSkills,
    setOppSkills 
} from "../controllers/skillsController.js";

const router = express.Router();

router.get("/field/:fieldName", getSkills);

router.get("/applicant/:applicantId", getApplicant);

router.get("/opportunity/:opportunityId", getOppSkills);

router.put("/applicant/me", authMiddleware, setAppSkills);

router.put("/opportunity/:opportunityId", authMiddleware, setOppSkills);

export default router;