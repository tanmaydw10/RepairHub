import { Router } from 'express';
import { createReview, getReviews } from '../controllers/reviewController.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getReviews);
router.post('/', optionalAuthenticate, createReview);

export default router;
