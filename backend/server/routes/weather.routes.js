hatimport express from 'express';
import { getWeather } from '../controllers/weather.controller.js';

const router = express.Router();

// GET /api/weather?destination=Calgary%2C+Canada
router.get('/weather', getWeather);

export default router;
