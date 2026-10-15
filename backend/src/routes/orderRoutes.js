import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All order admin routes require staff or owner role
router.use(requireAuth);
router.use(requireRole(['owner', 'staff', 'manager']));

router.get('/', orderController.getOrders);
router.get('/packing', orderController.getPackingOrders);
router.get('/customers', orderController.getCustomers);
router.get('/:id', orderController.getOrderDetails);
router.get('/:id/invoice', orderController.downloadInvoice);
router.patch('/:id/status', orderController.updateStatus);

export default router;

