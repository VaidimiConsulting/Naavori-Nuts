import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['owner', 'manager']));

router.get('/stats', getDashboardStats);

export default router;
