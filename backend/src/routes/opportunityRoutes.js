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
} from '../controllers/opportunityController.js';

// provider and admin auth middleware
import providerAuthMiddleware from '../middleware/providerAuthMiddleware.js';
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.get('/filters/locations', fetchLocations);
router.get('/filters/fields', fetchFields);
router.get('/filters/nqf-levels', fetchNqfLevels);
router.get('/', fetchOpportunities);

// provider
router.post('/publish', providerAuthMiddleware, publishOpportunity);
router.patch('/:id', providerAuthMiddleware, updateOpportunity);
router.post('/draft', providerAuthMiddleware, saveDraft);

// admin
router.get("/pending", requireAuth, requireAdmin, getPendingOpportunities);
router.get("/approved", requireAuth, requireAdmin, getApprovedOpportunities);
router.get('/:id', providerAuthMiddleware, getOpportunity);
router.patch("/:id/approve", requireAuth, requireAdmin, approveOpportunity);
router.patch("/:id/reject", requireAuth, requireAdmin, rejectOpportunity);
router.delete("/:id", requireAuth, requireAdmin, deleteOpportunity);


export default router;
