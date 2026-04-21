// ============================================
// APPLICATION ROUTES
// Uses the NEW providerAuthMiddleware (not the old one)
// ============================================

import express from 'express';
import { 
    fetchApplicationsByOpportunity, 
    patchApplicationStatus 
} from '../controllers/applicationController.js';
import providerAuthMiddleware from '../middleware/providerAuthMiddleware.js';  // ← NEW import

const router = express.Router();

// Use the NEW provider-specific auth middleware
router.use(providerAuthMiddleware);

// GET /api/applications/opportunity/:opportunityId
router.get('/opportunity/:opportunityId', fetchApplicationsByOpportunity);

// PATCH /api/applications/:applicationId
router.patch('/:applicationId', patchApplicationStatus);

export default router;