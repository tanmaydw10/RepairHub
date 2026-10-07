import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createRequest,
  getAllRequests,
  getRequestById,
  trackRequest,
  updateRequest,
  updateStatus,
  assignRepairer
} from '../controllers/requestController.js';
import { optionalAuthenticate, authenticate, requireRole } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'repair-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = Router();

// Public / Customer routes
router.post('/', optionalAuthenticate, upload.single('image'), createRequest);
router.get('/', optionalAuthenticate, getAllRequests);
router.get('/track/:id', trackRequest);
router.get('/:id', optionalAuthenticate, getRequestById);

// Protected Repairer / Admin actions
router.patch('/:id', authenticate, requireRole('repairer', 'admin'), updateRequest);
router.patch('/:id/status', authenticate, requireRole('repairer', 'admin'), updateStatus);
router.post('/:id/assign', authenticate, requireRole('repairer', 'admin'), assignRepairer);

export default router;
