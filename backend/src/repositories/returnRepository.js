import pool from '../config/db.js';
import crypto from 'crypto';

export const createReturnRequest = async ({ order_id, user_id, reason, items = [] }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const returnId = crypto.randomUUID();
    await connection.query(
      `INSERT INTO return_requests (id, order_id, user_id, reason, status) VALUES (?, ?, ?, ?, 'pending')`,
      [returnId, order_id, user_id, reason]
    );

    for (const item of items) {
      const returnItemId = crypto.randomUUID();
      await connection.query(
        `INSERT INTO return_items (id, return_request_id, order_item_id, quantity, is_restockable) VALUES (?, ?, ?, ?, ?)`,
        [returnItemId, returnId, item.order_item_id, Number(item.quantity || 1), Boolean(item.is_restockable)]
      );
    }

    // Update order status to 'returned' or note return requested
    await connection.query(
      `INSERT INTO order_status_history (id, order_id, status, note, created_by) VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), order_id, 'returned', `Return requested: ${reason}`, user_id]
    );

    await connection.commit();
    return returnId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const getAllReturns = async ({ status } = {}) => {
  let query = `
    SELECT 
      rr.id,
      rr.order_id,
      rr.user_id,
      rr.reason,
      rr.status,
      rr.admin_comment,
      rr.created_at,
      o.order_number,
      o.total as order_total,
      o.shipping_name,
      o.guest_email,
      o.shipping_phone,
      ref.amount as refund_amount,
      ref.status as refund_status
    FROM return_requests rr
    JOIN orders o ON rr.order_id = o.id
    LEFT JOIN refunds ref ON ref.return_request_id = rr.id
    WHERE 1=1
  `;
  const params = [];
  if (status && status !== 'all') {
    query += ` AND rr.status = ?`;
    params.push(status);
  }
  query += ` ORDER BY rr.created_at DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

export const getReturnById = async (id) => {
  const [[request]] = await pool.query(`
    SELECT rr.*, o.order_number, o.total, o.shipping_name, o.guest_email, o.shipping_phone
    FROM return_requests rr
    JOIN orders o ON rr.order_id = o.id
    WHERE rr.id = ?
  `, [id]);

  if (!request) return null;

  const [items] = await pool.query(`
    SELECT ri.*, oi.product_name, oi.weight_label, oi.price_per_unit
    FROM return_items ri
    JOIN order_items oi ON ri.order_item_id = oi.id
    WHERE ri.return_request_id = ?
  `, [id]);

  const [refunds] = await pool.query(`
    SELECT * FROM refunds WHERE return_request_id = ?
  `, [id]);

  return {
    ...request,
    items,
    refund: refunds[0] || null
  };
};

export const updateReturnStatus = async (id, { status, admin_comment }) => {
  const fields = ['status = ?'];
  const values = [status];
  if (admin_comment !== undefined) {
    fields.push('admin_comment = ?');
    values.push(admin_comment);
  }
  values.push(id);
  await pool.query(`UPDATE return_requests SET ${fields.join(', ')} WHERE id = ?`, values);
};

export const recordRefund = async ({ order_id, return_request_id, amount, method = 'original_payment', transaction_id }) => {
  const refundId = crypto.randomUUID();
  await pool.query(
    `INSERT INTO refunds (id, order_id, return_request_id, amount, method, status, transaction_id) VALUES (?, ?, ?, ?, ?, 'processed', ?)`,
    [refundId, order_id, return_request_id, Number(amount), method, transaction_id || `REF-${Date.now().toString().slice(-6)}`]
  );

  // Update return status to 'refunded'
  await pool.query(`UPDATE return_requests SET status = 'refunded' WHERE id = ?`, [return_request_id]);
  // Update order payment status
  await pool.query(`UPDATE orders SET payment_status = 'refunded' WHERE id = ?`, [order_id]);

  return refundId;
};
