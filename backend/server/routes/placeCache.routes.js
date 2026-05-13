import { Router } from 'express';
import {
  cachePlace,
  getCachedPlaceDetails,
} from '../controllers/placeCache.controller.js';

const router = Router();

router.post('/place-cache', cachePlace);
router.get('/place-cache/details', getCachedPlaceDetails); // New route for fetching cached details

export default router;
