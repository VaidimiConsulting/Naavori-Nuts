import pool from '../config/db.js';
import crypto from 'crypto';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const createUser = async (userData) => {
  const { id, email, password_hash, first_name, last_name, phone, role } = userData;
  await pool.query(
    'INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, email, password_hash || null, first_name, last_name || '', phone || '', role || 'customer']
  );
  return await findUserById(id);
};

export const updateUser = async (id, data) => {
  const fields = [];
  const values = [];
  if (data.first_name !== undefined) { fields.push('first_name = ?'); values.push(data.first_name); }
  if (data.last_name !== undefined) { fields.push('last_name = ?'); values.push(data.last_name); }
  if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
  if (data.password_hash !== undefined) { fields.push('password_hash = ?'); values.push(data.password_hash); }

  if (fields.length === 0) return await findUserById(id);
  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return await findUserById(id);
};

export const getUserAddresses = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
  return rows;
};

export const addUserAddress = async (addressData) => {
  const { id, user_id, full_name, phone, address_line1, address_line2, city, state, pin_code, is_default } = addressData;
  if (is_default) {
    await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [user_id]);
  }
  await pool.query(
    'INSERT INTO addresses (id, user_id, full_name, phone, address_line1, address_line2, city, state, pin_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, user_id, full_name, phone, address_line1, address_line2 || '', city, state, pin_code, is_default ? 1 : 0]
  );
  const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ?', [id]);
  return rows[0];
};

export const deleteUserAddress = async (addressId, userId) => {
  await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
};

// Only for seeding admin
export const seedAdminUser = async (email, password_hash) => {
  const admin = await findUserByEmail(email);
  if (!admin) {
    const id = crypto.randomUUID();
    await createUser({
      id,
      email,
      password_hash,
      first_name: 'Store',
      last_name: 'Owner',
      phone: '',
      role: 'owner'
    });
    console.log(`Admin user seeded: ${email}`);
  }
};

