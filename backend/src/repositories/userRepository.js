import pool from '../config/db.js';

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
    [id, email, password_hash, first_name, last_name, phone, role || 'customer']
  );
  return await findUserById(id);
};

// Only for seeding admin
export const seedAdminUser = async (email, password_hash) => {
  const admin = await findUserByEmail(email);
  if (!admin) {
    const id = crypto.randomUUID(); // Requires node 19+ or crypto module
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
