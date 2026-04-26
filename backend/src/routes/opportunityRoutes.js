import { Router } from 'express';
import {
  fetchLocations,
  fetchFields,
  fetchNqfLevels,
  fetchOpportunities,
  publishOpportunity,
  saveDraft,
} from '../controllers/opportunityController.js';
import providerAuthMiddleware from '../middleware/providerAuthMiddleware.js';

const router = Router();

router.get('/filters/locations', fetchLocations);
router.get('/filters/fields', fetchFields);
router.get('/filters/nqf-levels', fetchNqfLevels);
router.get('/', fetchOpportunities);
router.post('/publish', providerAuthMiddleware, publishOpportunity);
router.post('/draft', providerAuthMiddleware, saveDraft);


export default router;
