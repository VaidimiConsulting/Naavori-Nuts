import express from 'express';
import * as deliveryController from '../controllers/deliveryController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['owner', 'staff', 'manager']));

router.get('/', deliveryController.getAllDeliveries);
router.get('/slots', deliveryController.getDeliverySlots);
router.get('/partners', deliveryController.getDeliveryPartners);
router.post('/assign', deliveryController.assignDelivery);

export default router;
