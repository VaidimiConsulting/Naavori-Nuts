import express from 'express';
import * as configController from '../controllers/configController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['owner', 'manager']));

router.get('/settings', configController.getSettings);
router.post('/settings', configController.updateSettings);

router.get('/cms', configController.getCms);
router.post('/cms', configController.updateCms);

export default router;
