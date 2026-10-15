import express from 'express';
import * as returnController from '../controllers/returnController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['owner', 'staff', 'manager']));

router.get('/', returnController.getReturns);
router.get('/:id', returnController.getReturnDetails);
router.patch('/:id/status', returnController.updateReturnStatus);
router.post('/:id/refund', returnController.processRefund);

export default router;
