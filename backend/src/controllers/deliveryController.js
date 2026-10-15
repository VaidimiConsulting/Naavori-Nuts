import pool from '../config/db.js';
import crypto from 'crypto';

export const getAllDeliveries = async (req, res) => {
  try {
    const [deliveries] = await pool.query(`
      SELECT d.*, 
             o.order_number, o.shipping_name, o.shipping_phone, o.shipping_city, o.total,
             u.first_name as partner_first_name, u.last_name as partner_last_name, u.phone as partner_phone,
             ds.name as slot_name, ds.start_time, ds.end_time
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      LEFT JOIN users u ON d.partner_id = u.id
      LEFT JOIN delivery_slots ds ON d.slot_id = ds.id
      ORDER BY d.created_at DESC
    `);
    res.json({ success: true, data: deliveries });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deliveries' });
  }
};

export const getDeliverySlots = async (req, res) => {
  try {
    const [slots] = await pool.query('SELECT * FROM delivery_slots WHERE is_active = TRUE ORDER BY start_time ASC');
    res.json({ success: true, data: slots });
  } catch (error) {
    console.error('Error fetching delivery slots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery slots' });
  }
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const [partners] = await pool.query("SELECT id, first_name, last_name, phone, email FROM users WHERE role = 'delivery_partner' OR role = 'staff'");
    res.json({ success: true, data: partners });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery partners' });
  }
};

export const assignDelivery = async (req, res) => {
  try {
    const { order_id, partner_id, slot_id, eta } = req.body;
    if (!order_id || !partner_id) {
      return res.status(400).json({ success: false, message: 'Order and Partner are required' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit delivery OTP

    const [existing] = await pool.query('SELECT id FROM deliveries WHERE order_id = ?', [order_id]);
    if (existing.length > 0) {
      await pool.query(
        'UPDATE deliveries SET partner_id = ?, slot_id = ?, eta = ?, otp = ?, status = ? WHERE order_id = ?',
        [partner_id, slot_id || null, eta || null, otp, 'assigned', order_id]
      );
    } else {
      const id = crypto.randomUUID();
      await pool.query(
        'INSERT INTO deliveries (id, order_id, partner_id, slot_id, status, eta, otp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, order_id, partner_id, slot_id || null, 'assigned', eta || null, otp]
      );
    }

    // Update order status to shipped/assigned
    await pool.query("UPDATE orders SET order_status = 'shipped' WHERE id = ?", [order_id]);

    res.json({ success: true, message: 'Delivery partner assigned successfully', data: { otp } });
  } catch (error) {
    console.error('Error assigning delivery:', error);
    res.status(500).json({ success: false, message: 'Failed to assign delivery' });
  }
};
