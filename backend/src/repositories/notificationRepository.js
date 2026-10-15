import pool from '../config/db.js';
import crypto from 'crypto';

export const getNotifications = async (limit = 20) => {
  // First, retrieve logged notifications
  const [stored] = await pool.query(
    `SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );

  // Retrieve live pending operational items if needed
  const [openTickets] = await pool.query(
    `SELECT id, subject, created_at FROM support_tickets WHERE status = 'open' ORDER BY created_at DESC LIMIT 3`
  );

  const [placedOrders] = await pool.query(
    `SELECT id, order_number, total, created_at FROM orders WHERE order_status = 'placed' ORDER BY created_at DESC LIMIT 3`
  );

  const [lowStock] = await pool.query(
    `SELECT sb.id, p.name, sb.quantity, sb.expiry_date 
     FROM stock_batches sb 
     JOIN product_variants pv ON sb.variant_id = pv.id
     JOIN products p ON pv.product_id = p.id 
     WHERE sb.quantity <= 10 
     LIMIT 3`
  );

  // Combine stored notifications with dynamic live system events
  const dynamicNotifs = [];

  for (const t of openTickets) {
    dynamicNotifs.push({
      id: `dyn-ticket-${t.id}`,
      title: 'New Support Ticket',
      message: `Patron inquiry: "${t.subject}"`,
      type: 'system',
      link: '/admin/support',
      is_read: false,
      created_at: t.created_at
    });
  }

  for (const o of placedOrders) {
    dynamicNotifs.push({
      id: `dyn-order-${o.id}`,
      title: 'New Order Placed',
      message: `Order #${o.order_number || o.id?.slice(0, 8)} awaiting packing (₹${Number(o.total).toLocaleString('en-IN')})`,
      type: 'order',
      link: `/admin/orders/${o.id}`,
      is_read: false,
      created_at: o.created_at
    });
  }

  for (const s of lowStock) {
    dynamicNotifs.push({
      id: `dyn-stock-${s.id}`,
      title: 'Low Stock Alert',
      message: `${s.name} batch has only ${s.quantity} units left`,
      type: 'stock',
      link: '/admin/inventory',
      is_read: false,
      created_at: new Date()
    });
  }

  const all = [...stored.map(n => ({
    ...n,
    link: n.type === 'order' ? '/admin/orders' : '/admin/inventory'
  })), ...dynamicNotifs];

  // Sort newest first and deduplicate/limit
  all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return all.slice(0, limit);
};

export const createNotification = async ({ userId = null, title, message, type = 'system' }) => {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, FALSE, NOW())`,
    [id, userId, title, message, type]
  );
  return id;
};

export const markRead = async (id) => {
  if (id.startsWith('dyn-')) return true;
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
    [id]
  );
  return true;
};

export const markAllRead = async (userId = null) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE`
  );
  return true;
};
