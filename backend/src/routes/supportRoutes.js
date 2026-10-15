import express from 'express';
import * as supportController from '../controllers/supportController.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Customer endpoint to submit ticket or reply
router.post('/tickets', optionalAuth, supportController.createTicket);
router.post('/tickets/:id/reply', requireAuth, supportController.addReply);

// Admin-only endpoints
router.get('/admin/tickets', requireAuth, requireRole(['owner', 'staff', 'manager']), supportController.getTickets);
router.get('/admin/tickets/:id', requireAuth, requireRole(['owner', 'staff', 'manager']), supportController.getTicketDetails);
router.patch('/admin/tickets/:id/status', requireAuth, requireRole(['owner', 'staff', 'manager']), supportController.updateTicketStatus);

export default router;
