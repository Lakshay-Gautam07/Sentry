import { Router } from 'express';
import { getWeatherController } from '../controllers/weatherController.js';

const router = Router();

// GET /api/weather?lat=<latitude>&lon=<longitude>
router.get('/', getWeatherController);

export default router;
