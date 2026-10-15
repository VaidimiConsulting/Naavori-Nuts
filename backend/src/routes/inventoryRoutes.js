import express from 'express';
import * as inventoryController from '../controllers/inventoryController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['owner', 'staff', 'manager']));

router.get('/', inventoryController.getInventory);
router.patch('/variants/:variantId/stock', inventoryController.adjustStock);
router.post('/purchase', inventoryController.addPurchaseEntry);
router.get('/suppliers', inventoryController.getSuppliers);
router.post('/suppliers', inventoryController.createSupplier);
router.get('/variants', inventoryController.getVariants);

export default router;
