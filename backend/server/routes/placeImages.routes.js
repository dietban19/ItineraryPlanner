import express from 'express';

import {
  validatePlaceDetails,
  validatePlaceImage,
  validatePlaceSearch,
} from '../middleware/validatePlaceImage.js';
import {
  getPlaceDetails,
  getPlaceImage,
  searchPlaces,
} from '../controllers/placesImage.controllers.js';

const router = express.Router();

router.get('/place-image', validatePlaceImage, getPlaceImage);
router.get('/places/search', validatePlaceSearch, searchPlaces);
router.get('/places/details', validatePlaceDetails, getPlaceDetails);

export default router;
