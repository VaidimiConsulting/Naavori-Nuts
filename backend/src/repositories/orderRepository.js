import pool from '../config/db.js';

export const getAllOrders = async (filters, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      id, order_number, shipping_name, shipping_city, shipping_pin_code, 
      total, payment_method, payment_status, order_status, created_at 
    FROM orders 
    WHERE 1=1
  `;
  const params = [];

  if (filters.status) {
    query += ' AND order_status = ?';
    params.push(filters.status);
  }
  if (filters.search) {
    query += ' AND (order_number LIKE ? OR shipping_phone LIKE ? OR shipping_name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  
  // Count query
  let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
  const countParams = [];
  if (filters.status) { countQuery += ' AND order_status = ?'; countParams.push(filters.status); }
  if (filters.search) { 
    countQuery += ' AND (order_number LIKE ? OR shipping_phone LIKE ? OR shipping_name LIKE ?)';
    countParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }
  const [[{ total }]] = await pool.query(countQuery, countParams);

  return { orders: rows, total, page, limit };
};

export const getOrderById = async (id) => {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!orders.length) return null;

  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
  const [history] = await pool.query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at DESC', [id]);
  
  return { ...orders[0], items, history };
};

export const updateOrderStatus = async (id, status, note, userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
    
    const historyId = crypto.randomUUID(); // Requires node crypto module to be imported if not injected
    await connection.query(
      'INSERT INTO order_status_history (id, order_id, status, note, created_by) VALUES (?, ?, ?, ?, ?)',
      [historyId, id, status, note, userId]
    );

    // Handle stock restoration if cancelled or returned
    if (status === 'cancelled' || status === 'returned') {
      const [items] = await connection.query('SELECT product_name, weight_label, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        await connection.query(
          `UPDATE product_variants pv 
           JOIN products p ON pv.product_id = p.id
           SET pv.stock = pv.stock + ? 
           WHERE p.name = ? AND pv.weight_label = ?`,
          [item.quantity, item.product_name, item.weight_label]
        );
      }
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const createOrder = async (orderData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const orderId = crypto.randomUUID();
    const orderNumber = 'NV' + Date.now().toString().slice(-6);

    await connection.query(
      `INSERT INTO orders (
        id, order_number, user_id, shipping_name, shipping_phone, guest_email,
        shipping_address_line1, shipping_city, shipping_state, shipping_pin_code,
        subtotal, discount, shipping_charge, gst_amount, total, coupon_id, payment_method, payment_status, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, orderNumber, orderData.user_id || null, orderData.shipping_name, orderData.shipping_phone, orderData.guest_email || null,
        orderData.shipping_address, orderData.shipping_city, orderData.shipping_state, orderData.shipping_pin_code,
        orderData.subtotal, orderData.discount || 0, orderData.shipping_fee, orderData.tax, orderData.total, orderData.coupon_id || null, orderData.payment_method || 'cod', orderData.payment_status || 'pending', 'placed'
      ]
    );

    for (const item of orderData.items) {
      await connection.query(
        `INSERT INTO order_items (
          id, order_id, variant_id, product_name, weight_label, price_per_unit, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(), orderId, item.product_variant_id || null, item.product_name, item.weight_label,
          item.price, item.quantity, item.price * item.quantity
        ]
      );

      // Deduct inventory
      await connection.query(
        `UPDATE product_variants pv 
         JOIN products p ON pv.product_id = p.id
         SET pv.stock = pv.stock - ? 
         WHERE p.name = ? AND pv.weight_label = ?`,
        [item.quantity, item.product_name, item.weight_label]
      );
    }
    
    // Increment coupon usage count
    if (orderData.coupon_id) {
      await connection.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [orderData.coupon_id]);
    }

    const historyId = crypto.randomUUID();
    await connection.query(
      'INSERT INTO order_status_history (id, order_id, status, note, created_by) VALUES (?, ?, ?, ?, ?)',
      [historyId, orderId, 'placed', 'Order placed by customer', null]
    );

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getOrdersByEmail = async (email) => {
  const [orders] = await pool.query(
    'SELECT id, order_number, total, payment_method, order_status, created_at FROM orders WHERE guest_email = ? ORDER BY created_at DESC',
    [email]
  );
  
  for (let order of orders) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
  }
  return orders;
};

