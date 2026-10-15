import express from 'express';
import * as notifController from '../controllers/notificationController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth, requireRole(['owner', 'staff', 'manager']));

router.get('/', notifController.getNotifications);
router.post('/read-all', notifController.markAllRead);
router.patch('/:id/read', notifController.markRead);

export default router;
