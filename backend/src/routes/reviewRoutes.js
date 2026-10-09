import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', reviewController.getReviews);
router.post('/', reviewController.createReview);

// Admin only routes
router.delete('/:id', requireAuth, requireRole(['owner', 'staff']), reviewController.deleteReview);

export default router;
