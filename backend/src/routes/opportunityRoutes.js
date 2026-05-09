import { Router } from 'express';
import {
  fetchLocations,
  fetchFields,
  fetchNqfLevels,
  fetchOpportunities,
  publishOpportunity,
  updateOpportunity,
  getOpportunity,
  saveDraft,
  getPendingOpportunities,
  getApprovedOpportunities,
  approveOpportunity,
  rejectOpportunity,
  deleteOpportunity,
  getMatchingOpportunities,
} from '../controllers/opportunityController.js';

// provider and admin auth middleware
import providerAuthMiddleware from '../middleware/providerAuthMiddleware.js';
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();


router.get('/filters/locations', fetchLocations);
router.get('/filters/fields', fetchFields);
router.get('/filters/nqf-levels', fetchNqfLevels);
router.get('/', fetchOpportunities);

router.get("/matches", authMiddleware, getMatchingOpportunities);

// provider
router.post('/publish', providerAuthMiddleware, publishOpportunity);
router.post('/draft', providerAuthMiddleware, saveDraft);
router.patch('/:id', providerAuthMiddleware, updateOpportunity);
router.get('/:id', providerAuthMiddleware, getOpportunity);

// admin
router.get("/pending", requireAuth, requireAdmin, getPendingOpportunities);
router.get("/approved", requireAuth, requireAdmin, getApprovedOpportunities);
router.patch("/:id/approve", requireAuth, requireAdmin, approveOpportunity);
router.patch("/:id/reject", requireAuth, requireAdmin, rejectOpportunity);
router.delete("/:id", requireAuth, requireAdmin, deleteOpportunity);

// provider edit prefill


export default router;
