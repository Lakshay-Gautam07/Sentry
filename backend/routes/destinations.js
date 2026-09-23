import { Router } from 'express';
import { searchDestinationsController } from '../controllers/destinationsController.js';

const router = Router();

// GET /api/destinations/search?q=<destination>
router.get('/search', searchDestinationsController);

export default router;
