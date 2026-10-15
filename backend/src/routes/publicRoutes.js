import express from 'express';
import * as orderController from '../controllers/orderController.js';

import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

import * as couponController from '../controllers/couponController.js';
import * as returnController from '../controllers/returnController.js';

import pool from '../config/db.js';

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

router.post('/coupons/apply', couponController.applyCoupon);
router.post('/coupons/validate', couponController.applyCoupon);
router.post('/orders', requireAuth, orderController.createOrder);
router.get('/orders/:id/invoice', optionalAuth, orderController.downloadInvoice);
router.get('/orders/:email', orderController.getCustomerOrders);
router.post('/returns', (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Notice: As NAAVORI products are perishable gourmet food items, all orders are strictly non-returnable and non-refundable once dispatched to preserve pristine food safety and hygiene.'
  });
});

router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    await pool.query('INSERT IGNORE INTO newsletter_subscribers (id, email) VALUES (UUID(), ?)', [email]);
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ success: false, message: 'Failed to subscribe' });
  }
});

export default router;
