import { Router } from 'express';
import { getNewsController } from '../controllers/newsController.js';

const router = Router();

// GET /api/news?destination=<name>&country=<country>
router.get('/', getNewsController);

export default router;
