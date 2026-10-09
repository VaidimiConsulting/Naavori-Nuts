import express from 'express';
import * as couponController from '../controllers/couponController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['owner', 'manager']));

router.get('/', couponController.getAllCoupons);
router.post('/', couponController.createCoupon);
router.patch('/:id/status', couponController.toggleCouponStatus);
router.delete('/:id', couponController.deleteCoupon);

export default router;
