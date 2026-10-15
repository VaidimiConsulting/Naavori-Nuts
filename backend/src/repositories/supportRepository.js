import pool from '../config/db.js';
import crypto from 'crypto';

export const createTicket = async ({ user_id, order_id, subject, message }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const ticketId = crypto.randomUUID();
    await connection.query(
      `INSERT INTO support_tickets (id, user_id, order_id, subject, status) VALUES (?, ?, ?, ?, 'open')`,
      [ticketId, user_id, order_id || null, subject]
    );

    const replyId = crypto.randomUUID();
    await connection.query(
      `INSERT INTO ticket_replies (id, ticket_id, sender_id, message) VALUES (?, ?, ?, ?)`,
      [replyId, ticketId, user_id, message]
    );

    await connection.commit();
    return ticketId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const getAllTickets = async ({ status } = {}) => {
  let query = `
    SELECT 
      st.id,
      st.subject,
      st.status,
      st.created_at,
      st.updated_at,
      st.order_id,
      u.email as customer_email,
      u.first_name,
      u.last_name,
      u.phone,
      o.order_number,
      (SELECT COUNT(*) FROM ticket_replies tr WHERE tr.ticket_id = st.id) as reply_count
    FROM support_tickets st
    JOIN users u ON st.user_id = u.id
    LEFT JOIN orders o ON st.order_id = o.id
    WHERE 1=1
  `;
  const params = [];
  if (status && status !== 'all') {
    query += ` AND st.status = ?`;
    params.push(status);
  }
  query += ` ORDER BY st.updated_at DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

export const getTicketById = async (id) => {
  const [[ticket]] = await pool.query(`
    SELECT 
      st.*,
      u.email as customer_email,
      u.first_name,
      u.last_name,
      u.phone,
      o.order_number,
      o.total as order_total
    FROM support_tickets st
    JOIN users u ON st.user_id = u.id
    LEFT JOIN orders o ON st.order_id = o.id
    WHERE st.id = ?
  `, [id]);

  if (!ticket) return null;

  const [replies] = await pool.query(`
    SELECT 
      tr.*,
      u.first_name,
      u.last_name,
      u.role as sender_role
    FROM ticket_replies tr
    JOIN users u ON tr.sender_id = u.id
    WHERE tr.ticket_id = ?
    ORDER BY tr.created_at ASC
  `, [id]);

  return {
    ...ticket,
    replies
  };
};

export const addTicketReply = async ({ ticket_id, sender_id, message }) => {
  const replyId = crypto.randomUUID();
  await pool.query(
    `INSERT INTO ticket_replies (id, ticket_id, sender_id, message) VALUES (?, ?, ?, ?)`,
    [replyId, ticket_id, sender_id, message]
  );
  await pool.query(`UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [ticket_id]);
  return replyId;
};

export const updateTicketStatus = async (id, status) => {
  await pool.query(`UPDATE support_tickets SET status = ? WHERE id = ?`, [status, id]);
};
