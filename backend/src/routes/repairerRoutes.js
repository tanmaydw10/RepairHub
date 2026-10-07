import { Router } from 'express';
import { getDashboardStats, getProfile, updateProfile } from '../controllers/repairerController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protected repairer routes
router.get('/dashboard/stats', authenticate, requireRole('repairer', 'admin'), getDashboardStats);
router.get('/profile', authenticate, requireRole('repairer', 'admin'), getProfile);
router.put('/profile', authenticate, requireRole('repairer', 'admin'), updateProfile);

export default router;
