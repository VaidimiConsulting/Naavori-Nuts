import * as orderRepository from '../repositories/orderRepository.js';
import pool from '../config/db.js';
import crypto from 'crypto';
import { sendOrderShippedEmail } from '../utils/emailService.js';

// In Node v19+, crypto.randomUUID is available globally, but we import it just in case.
if (!global.crypto) {
  global.crypto = crypto;
}

export const getOrders = async (req, res) => {
  try {
    const { status, search, page, limit } = req.query;
    
    const result = await orderRepository.getAllOrders(
      { status, search }, 
      parseInt(page) || 1, 
      parseInt(limit) || 20
    );

    res.json({ success: true, data: result.orders, meta: { total: result.total, page: result.page, limit: result.limit } });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const order = await orderRepository.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatuses = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await orderRepository.updateOrderStatus(id, status, note || `Status updated to ${status}`, req.user.id);
    
    // Send shipping email when order is shipped / out for delivery
    if (status === 'shipped' || status === 'out_for_delivery') {
      const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
      if (orders.length > 0) {
        const order = orders[0];
        const email = order.guest_email;
        if (email) {
          await sendOrderShippedEmail(order, email).catch(console.error);
        }
      }
    }

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Basic validation
    console.log("RECEIVED ORDER DATA:", orderData);
    if (!orderData.shipping_name || !orderData.shipping_phone || !orderData.items || !orderData.items.length) {
      return res.status(400).json({ success: false, message: 'Missing required order details' });
    }

    if (req.user) {
      orderData.user_id = req.user.id;
      orderData.guest_email = req.user.email;
    } else {
      orderData.guest_email = orderData.shipping_email;
    }

    const orderId = await orderRepository.createOrder(orderData);
    res.status(201).json({ success: true, message: 'Order created successfully', data: { orderId } });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const orders = await orderRepository.getOrdersByEmail(email);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders' });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT 
        guest_email as email, 
        MAX(shipping_name) as name, 
        MAX(shipping_phone) as phone, 
        MAX(shipping_city) as city,
        MAX(created_at) as last_order_date, 
        COUNT(id) as total_orders,
        SUM(total) as total_spent
      FROM orders 
      WHERE guest_email IS NOT NULL AND guest_email != ''
      GROUP BY guest_email
      ORDER BY last_order_date DESC
    `);
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

