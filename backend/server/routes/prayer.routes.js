import express from 'express';
import { getPrayerTimes } from '../controllers/prayer.controller.js';

const router = express.Router();

// GET /api/prayer-times?destination=Calgary%2C+Canada&method=2
router.get('/prayer-times', getPrayerTimes);

export default router;
