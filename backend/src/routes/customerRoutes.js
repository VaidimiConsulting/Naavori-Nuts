import express from 'express';
import pool from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All customer routes require admin/owner/manager role
router.use(requireAuth);
router.use(requireRole(['owner', 'staff', 'manager']));

// GET /api/v1/admin/customers — list all customers with stats & filters
router.get('/', async (req, res) => {
  try {
    const { search, nameSearch, startDate, endDate, page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT * FROM (
        SELECT 
          u.email as email,
          TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))) as name,
          COALESCE(MAX(o.shipping_phone), u.phone, '') as phone,
          COALESCE(MAX(o.shipping_city), 'Varanasi') as city,
          COALESCE(MAX(o.shipping_state), 'UP') as state,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o.total), 0) as total_spent,
          MAX(o.created_at) as last_order_date,
          u.created_at as member_since,
          1 as is_registered
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id OR o.guest_email = u.email
        WHERE u.role = 'customer'
        GROUP BY u.email, u.id, u.first_name, u.last_name, u.phone, u.created_at
        UNION
        SELECT
          o.guest_email as email,
          MAX(o.shipping_name) as name,
          MAX(o.shipping_phone) as phone,
          MAX(o.shipping_city) as city,
          MAX(o.shipping_state) as state,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o.total), 0) as total_spent,
          MAX(o.created_at) as last_order_date,
          MIN(o.created_at) as member_since,
          0 as is_registered
        FROM orders o
        WHERE o.guest_email IS NOT NULL AND o.guest_email != '' 
          AND o.guest_email NOT IN (SELECT email FROM users WHERE role = 'customer')
        GROUP BY o.guest_email
      ) as unified_customers
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (email LIKE ? OR name LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (nameSearch) {
      query += ` AND name LIKE ?`;
      params.push(`%${nameSearch}%`);
    }

    if (startDate) {
      query += ` AND (COALESCE(last_order_date, member_since) >= ?)`;
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      query += ` AND (COALESCE(last_order_date, member_since) <= ?)`;
      params.push(`${endDate} 23:59:59`);
    }

    query += ` ORDER BY COALESCE(last_order_date, member_since) DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [customers] = await pool.query(query, params);

    // Total Count
    let countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT u.email FROM users u WHERE u.role = 'customer'
        UNION
        SELECT o.guest_email as email FROM orders o WHERE o.guest_email IS NOT NULL AND o.guest_email != ''
      ) as all_emails
    `;
    const [[{ total }]] = await pool.query(countQuery);

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

// GET /api/v1/admin/customers/:email — get specific customer with their orders & addresses
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const [userRows] = await pool.query(`
      SELECT id, email, first_name, last_name, phone, role, created_at
      FROM users WHERE email = ?
    `, [email]);

    const userId = userRows[0]?.id || 'none';

    const [orders] = await pool.query(`
      SELECT id, order_number, order_status, payment_status, total, shipping_name, shipping_phone, shipping_city, shipping_address_line1 as shipping_address, created_at
      FROM orders
      WHERE guest_email = ? OR user_id = ?
      ORDER BY created_at DESC
    `, [email, userId]);

    let addresses = [];
    if (userRows.length > 0) {
      const [addrRows] = await pool.query(`
        SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC
      `, [userRows[0].id]);
      addresses = addrRows;
    }

    const customerName = userRows[0] 
      ? `${userRows[0].first_name || ''} ${userRows[0].last_name || ''}`.trim()
      : (orders[0]?.shipping_name || 'Guest Patron');

    const customerPhone = userRows[0]?.phone || orders[0]?.shipping_phone || '';
    const customerCity = orders[0]?.shipping_city || addresses[0]?.city || 'Varanasi';

    const customerInfo = {
      email,
      id: userRows[0]?.id || null,
      name: customerName,
      phone: customerPhone,
      city: customerCity,
      is_registered: userRows.length > 0 ? 1 : 0,
      member_since: userRows[0]?.created_at || orders[orders.length - 1]?.created_at || null,
      last_order_date: orders[0]?.created_at || null,
      total_orders: orders.length,
      total_spent: orders.reduce((sum, o) => sum + Number(o.total || 0), 0),
      orders,
      addresses
    };

    res.json({ success: true, data: customerInfo });
  } catch (error) {
    console.error('Error fetching customer detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer' });
  }
});

// PUT /api/v1/admin/customers/:email — update customer details (name, phone, city)
router.put('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { name, phone, city } = req.body;

    const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userRows.length > 0) {
      const nameParts = (name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE email = ?',
        [firstName, lastName, phone || '', email]
      );
    }

    // Also update order shipping name/phone/city if requested
    if (name || phone || city) {
      await pool.query(
        `UPDATE orders SET 
          shipping_name = COALESCE(?, shipping_name),
          shipping_phone = COALESCE(?, shipping_phone),
          shipping_city = COALESCE(?, shipping_city)
         WHERE guest_email = ? OR user_id = ?`,
        [name || null, phone || null, city || null, email, userRows[0]?.id || 'none']
      );
    }

    res.json({ success: true, message: 'Customer details updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer' });
  }
});

// DELETE /api/v1/admin/customers/:email — remove customer account and unlink orders
router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userRows.length > 0) {
      const userId = userRows[0].id;
      // Detach orders from user_id so orders are kept intact
      await pool.query('UPDATE orders SET user_id = NULL WHERE user_id = ?', [userId]);
      // Remove addresses
      await pool.query('DELETE FROM addresses WHERE user_id = ?', [userId]);
      // Remove user record
      await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    }

    // Clear guest_email on orders so they don't linger in directory
    await pool.query('UPDATE orders SET guest_email = NULL WHERE guest_email = ?', [email]);

    res.json({ success: true, message: 'Patron removed successfully from directory' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Failed to delete customer' });
  }
});

export default router;
