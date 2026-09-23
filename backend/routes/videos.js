import { Router } from 'express';
import { getVideosController } from '../controllers/youtubeController.js';

const router = Router();

// GET /api/videos?destination=<name>&country=<country>
router.get('/', getVideosController);

export default router;
