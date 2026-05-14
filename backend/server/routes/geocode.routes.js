import express from 'express';
import { autocompleteDestination } from '../controllers/geocode.controller.js';

const router = express.Router();

router.get('/geocode/autocomplete', autocompleteDestination);

export default router;
