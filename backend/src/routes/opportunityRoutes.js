import { Router } from 'express';
import {
  fetchLocations,
  fetchFields,
  fetchNqfLevels,
  fetchOpportunities,
} from '../controllers/opportunityController.js';

const router = Router();

router.get('/filters/locations', fetchLocations);
router.get('/filters/fields', fetchFields);
router.get('/filters/nqf-levels', fetchNqfLevels);
router.get('/', fetchOpportunities);

export default router;
