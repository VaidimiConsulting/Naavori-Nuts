import express from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', requireAuth, authController.getProfile);

// Admin-only test route
router.get('/admin-test', requireAuth, requireRole(['owner', 'staff']), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin' });
});

export default router;
