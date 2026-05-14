import express from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import {
  getMyTrips,
  getTrip,
  createTrip,
  saveTrip,
  deleteTrip,
  lookupTripByCode,
  joinTrip,
  ensureShareCode,
} from '../controllers/trip.controller.js';

const router = express.Router();

router.use(verifyFirebaseToken);

router.get('/trips', getMyTrips);
router.post('/trips', createTrip);
// /code/:code must be declared before /:id so Express doesn't treat "code" as an id
router.get('/trips/code/:code', lookupTripByCode);
router.get('/trips/:id', getTrip);
router.put('/trips/:id', saveTrip);
router.delete('/trips/:id', deleteTrip);
router.post('/trips/:id/join', joinTrip);
router.post('/trips/:id/share-code', ensureShareCode);

export default router;