import express from "express";
import { apply } from "../controllers/applicationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
// POST /applications - Apply to an opportunity (applicant only)
router.post("/", authMiddleware, apply);

export default router;