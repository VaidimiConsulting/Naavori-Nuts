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
    const { status, search, date, month, startDate, endDate, city, state, page, limit } = req.query;
    
    const result = await orderRepository.getAllOrders(
      { status, search, date, month, startDate, endDate, city, state }, 
      parseInt(page) || 1, 
      parseInt(limit) || 50
    );

    res.json({ 
      success: true, 
      data: result.orders, 
      summary: {
        total_orders: result.total,
        total_revenue: result.totalRevenue,
        location_breakdown: result.locationBreakdown,
        status_breakdown: result.statusCounts,
      },
      meta: { total: result.total, page: result.page, limit: result.limit } 
    });
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

    // 1. Mandatory Authentication Check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please create an account or sign in before placing your order.' 
      });
    }

    // 2. Mandatory Mobile Number Check
    const cleanPhone = (orderData.shipping_phone || '').trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'A valid 10-digit mobile number is mandatory to place an order.' 
      });
    }

    // 3. Mandatory Delivery Address Check
    if (!orderData.shipping_address || !orderData.shipping_address.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delivery address line is mandatory to place an order.' 
      });
    }

    if (!orderData.shipping_city || !orderData.shipping_city.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'City is mandatory to place an order.' 
      });
    }

    if (!orderData.shipping_pin_code || !orderData.shipping_pin_code.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'PIN code is mandatory to place an order.' 
      });
    }

    if (!orderData.items || !orderData.items.length) {
      return res.status(400).json({ success: false, message: 'Your shopping bag is empty.' });
    }

    orderData.user_id = req.user.id;
    orderData.guest_email = req.user.email || orderData.shipping_email;
    orderData.shipping_phone = cleanPhone;

    // Optional: Auto-save address to user's address book if not already saved
    try {
      const [existing] = await pool.query(
        'SELECT id FROM addresses WHERE user_id = ? AND address_line1 = ? LIMIT 1',
        [req.user.id, orderData.shipping_address]
      );
      if (existing.length === 0) {
        const addrId = crypto.randomUUID();
        await pool.query(
          'INSERT INTO addresses (id, user_id, full_name, phone, address_line1, city, state, pin_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [addrId, req.user.id, orderData.shipping_name || 'Customer', cleanPhone, orderData.shipping_address, orderData.shipping_city, orderData.shipping_state || 'India', orderData.shipping_pin_code]
        );
      }
    } catch (addrErr) {
      console.warn('Address auto-save note:', addrErr.message);
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

export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderRepository.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Naavori-Invoice-${order.order_number}.pdf"`);

    const { generateOrderInvoicePDF } = await import('../utils/invoiceService.js');
    await generateOrderInvoicePDF(order, res);
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate PDF invoice' });
    }
  }
};

export const getPackingOrders = async (req, res) => {
  try {
    const orders = await orderRepository.getAllOrders({ status: 'placed' });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching packing orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch packing orders' });
  }
};


