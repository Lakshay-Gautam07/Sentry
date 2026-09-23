import { Router } from 'express';
import { getAlertsController } from '../controllers/alertsController.js';

const router = Router();

// GET /api/alerts?lat=&lon=&country=&countryCode=&region=&name=
router.get('/', getAlertsController);

export default router;
