import { Router } from 'express';
import { getSummaryController } from '../controllers/summaryController.js';

const router = Router();

// GET /api/summary?destination=...&country=...
router.get('/', getSummaryController);

// POST /api/summary (with current weather, alerts, and news in body)
router.post('/', getSummaryController);

export default router;
