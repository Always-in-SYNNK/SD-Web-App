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
import authMiddleware from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { preventSelfModeration } from '../middleware/preventSelfModeration.js';

const router = Router();


router.get('/filters/locations', fetchLocations);
router.get('/filters/fields', fetchFields);
router.get('/filters/nqf-levels', fetchNqfLevels);
router.get('/', fetchOpportunities);

router.get("/matches", requireAuth, getMatchingOpportunities);

// provider
router.post('/publish', providerAuthMiddleware, publishOpportunity);
router.post('/draft', providerAuthMiddleware, saveDraft);

// admin
router.get("/pending", requireAuth, requireAdmin, getPendingOpportunities);
router.get("/approved", requireAuth, requireAdmin, getApprovedOpportunities);

//provider -- order was changed to avoid conflict with admin routes
router.patch('/:id', providerAuthMiddleware, updateOpportunity);
router.get('/:id', providerAuthMiddleware, getOpportunity);

//admin
router.patch("/:id/approve", requireAuth, requireAdmin, preventSelfModeration,approveOpportunity);
router.patch("/:id/reject", requireAuth, requireAdmin, preventSelfModeration, rejectOpportunity);
router.delete("/:id", requireAuth, requireAdmin, preventSelfModeration, deleteOpportunity);

export default router;
