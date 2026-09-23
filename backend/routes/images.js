import { Router } from 'express';
import { getImagesController } from '../controllers/imagesController.js';

const router = Router();

// GET /api/images?destination=<name>&country=<country>
router.get('/', getImagesController);

export default router;
