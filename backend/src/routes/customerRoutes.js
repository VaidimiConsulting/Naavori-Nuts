import express from 'express';
import pool from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All customer routes require admin/owner/manager role
router.use(requireAuth);
router.use(requireRole(['owner', 'staff', 'manager']));

// GET /api/v1/admin/customers — list all customers with stats
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = `
      SELECT 
        guest_email as email,
        MAX(shipping_name) as name,
        MAX(shipping_phone) as phone,
        MAX(shipping_city) as city,
        MAX(shipping_state) as state,
        COUNT(id) as total_orders,
        SUM(total) as total_spent,
        MAX(created_at) as last_order_date,
        MIN(created_at) as first_order_date
      FROM orders
      WHERE guest_email IS NOT NULL AND guest_email != ''
    `;
    const params = [];

    if (search) {
      query += ` AND (guest_email LIKE ? OR shipping_name LIKE ? OR shipping_phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY guest_email ORDER BY last_order_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [customers] = await pool.query(query, params);

    // Total count
    let countQuery = `SELECT COUNT(DISTINCT guest_email) as total FROM orders WHERE guest_email IS NOT NULL AND guest_email != ''`;
    const countParams = [];
    if (search) {
      countQuery += ` AND (guest_email LIKE ? OR shipping_name LIKE ? OR shipping_phone LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: customers,
      meta: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// GET /api/v1/admin/customers/:email — get specific customer with their orders
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const [orders] = await pool.query(`
      SELECT id, order_number, order_status, payment_status, total, created_at
      FROM orders
      WHERE guest_email = ?
      ORDER BY created_at DESC
    `, [email]);

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const customerInfo = {
      email,
      total_orders: orders.length,
      total_spent: orders.reduce((sum, o) => sum + Number(o.total), 0),
      orders
    };

    res.json({ success: true, data: customerInfo });
  } catch (error) {
    console.error('Error fetching customer detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer' });
  }
});

export default router;
