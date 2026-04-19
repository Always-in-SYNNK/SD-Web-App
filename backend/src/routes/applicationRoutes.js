import express from "express";
import { accept, apply, getMyApplications, unapply } from "../controllers/applicationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
// POST /applications - Apply to an opportunity (applicant only)
router.post("/", authMiddleware, apply);
router.get("/my", authMiddleware, getMyApplications);
router.post("/accept", authMiddleware, accept);
router.delete("/:id", authMiddleware, unapply);

export default router;