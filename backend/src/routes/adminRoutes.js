import express from "express";
import {
  applyForAdmin,
  getMyAdminApplicationStatus,
  getAdminApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/adminController.js";
import { 
    getPlacementRates,
} from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// USER applies
router.post("/apply", requireAuth, applyForAdmin);
router.get("/me/application-status", requireAuth, getMyAdminApplicationStatus);

// ADMIN views applications
router.get("/applications", requireAuth, requireAdmin, getAdminApplications);
// ADMIN views analytics
router.get("/analytics/placements", requireAuth, requireAdmin, getPlacementRates);

// ADMIN actions
router.patch("/:id/approve", requireAuth, requireAdmin, approveApplication);
router.patch("/:id/reject", requireAuth, requireAdmin, rejectApplication);

export default router;