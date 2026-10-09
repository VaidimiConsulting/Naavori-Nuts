import express from 'express';
import * as orderController from '../controllers/orderController.js';
import * as paymentController from '../controllers/paymentController.js';

import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

import * as couponController from '../controllers/couponController.js';

router.post('/coupons/apply', couponController.applyCoupon);
router.post('/orders', optionalAuth, orderController.createOrder);
router.get('/orders/:email', orderController.getCustomerOrders);
router.post('/payment/order', paymentController.createRazorpayOrder);
router.post('/payment/verify', paymentController.verifyPayment);

export default router;
