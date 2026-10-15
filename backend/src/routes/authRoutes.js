import express from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// General / Admin Auth
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getProfile);

// Customer Specific Auth
router.post('/customer/register', authController.registerCustomer);
router.post('/customer/login', authController.loginCustomer);
router.get('/customer/me', requireAuth, authController.getCustomerProfile);
router.put('/customer/me', requireAuth, authController.updateCustomerProfile);
router.get('/customer/addresses', requireAuth, authController.getCustomerAddresses);
router.post('/customer/addresses', requireAuth, authController.addCustomerAddress);
router.delete('/customer/addresses/:id', requireAuth, authController.deleteCustomerAddress);

// Admin-only test route
router.get('/admin-test', requireAuth, requireRole(['owner', 'staff']), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin' });
});

export default router;

