import pool from '../config/db.js';
import crypto from 'crypto';

export const getInventoryLedger = async ({ search = '', filter = '' } = {}) => {
  let query = `
    SELECT 
      pv.id as variant_id,
      pv.sku,
      pv.weight_label,
      pv.price,
      pv.stock as qty,
      20 as threshold,
      p.id as product_id,
      p.name,
      sb.id as batch_id,
      COALESCE(sb.batch_no, 'DEFAULT-B1') as batch,
      COALESCE(sb.expiry_date, DATE_ADD(CURRENT_DATE, INTERVAL 180 DAY)) as expiry,
      sb.cost_per_unit
    FROM product_variants pv
    INNER JOIN products p ON pv.product_id = p.id
    LEFT JOIN (
      -- Get latest or nearest expiring batch per variant (FEFO)
      SELECT b1.* 
      FROM stock_batches b1
      INNER JOIN (
        SELECT variant_id, MIN(COALESCE(expiry_date, '9999-12-31')) as min_expiry
        FROM stock_batches
        GROUP BY variant_id
      ) b2 ON b1.variant_id = b2.variant_id AND COALESCE(b1.expiry_date, '9999-12-31') = b2.min_expiry
    ) sb ON sb.variant_id = pv.id
    WHERE 1=1
  `;

  const params = [];

  if (search) {
    query += ` AND (p.name LIKE ? OR pv.sku LIKE ? OR sb.batch_no LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (filter === 'low_stock') {
    query += ` AND pv.stock <= 20`;
  } else if (filter === 'expiring_soon') {
    query += ` AND sb.expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY)`;
  }

  query += ` ORDER BY pv.stock ASC, p.name ASC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

export const adjustStock = async (variantId, delta) => {
  const [result] = await pool.query(
    `UPDATE product_variants SET stock = GREATEST(0, stock + ?) WHERE id = ?`,
    [Number(delta), variantId]
  );
  const [[updated]] = await pool.query(
    `SELECT pv.*, p.name FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.id = ?`,
    [variantId]
  );
  return updated;
};

export const addBatchAndStock = async ({ variant_id, batch_no, quantity, cost_per_unit, expiry_date, supplier_id, invoice_number, user_id }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let purchaseEntryId = null;
    if (supplier_id || invoice_number) {
      purchaseEntryId = crypto.randomUUID();
      const totalCost = Number(quantity) * Number(cost_per_unit || 0);
      await connection.query(
        `INSERT INTO purchase_entries (id, supplier_id, invoice_number, total_cost, created_by) VALUES (?, ?, ?, ?, ?)`,
        [purchaseEntryId, supplier_id || null, invoice_number || 'INV-DIRECT', totalCost, user_id || null]
      );
    }

    const batchId = crypto.randomUUID();
    await connection.query(
      `INSERT INTO stock_batches (id, variant_id, purchase_entry_id, batch_no, quantity, cost_per_unit, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [batchId, variant_id, purchaseEntryId, batch_no || `B-${Date.now().toString().slice(-4)}`, Number(quantity), Number(cost_per_unit || 0), expiry_date || null]
    );

    // Update variant stock quantity
    await connection.query(
      `UPDATE product_variants SET stock = stock + ? WHERE id = ?`,
      [Number(quantity), variant_id]
    );

    await connection.commit();
    return { batchId, purchaseEntryId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const getSuppliers = async () => {
  const [rows] = await pool.query(`SELECT * FROM suppliers ORDER BY name ASC`);
  return rows;
};

export const createSupplier = async (data) => {
  const id = crypto.randomUUID();
  const { name, contact_person, phone, email, address } = data;
  await pool.query(
    `INSERT INTO suppliers (id, name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, contact_person || '', phone || '', email || '', address || '']
  );
  const [[supplier]] = await pool.query(`SELECT * FROM suppliers WHERE id = ?`, [id]);
  return supplier;
};

export const getProductVariantsList = async () => {
  const [rows] = await pool.query(`
    SELECT pv.id as variant_id, pv.sku, pv.weight_label, pv.price, pv.stock, p.name as product_name
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    ORDER BY p.name ASC, pv.weight_label ASC
  `);
  return rows;
};
