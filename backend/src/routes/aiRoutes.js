import { Router } from 'express';
import { diagnoseProblem } from '../controllers/aiController.js';

const router = Router();

router.post('/diagnose', diagnoseProblem);

export default router;
