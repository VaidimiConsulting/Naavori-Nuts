import pool from '../config/db.js';

export const getAllProducts = async (filters, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      p.id, p.name, p.hindi_name, p.slug, p.origin, p.is_active, p.created_at,
      c.name as category_name,
      (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as starting_price,
      (SELECT SUM(stock) FROM product_variants WHERE product_id = p.id) as total_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.search) {
    query += ' AND (p.name LIKE ? OR p.slug LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.category_id) {
    query += ' AND p.category_id = ?';
    params.push(filters.category_id);
  }
  if (filters.status) {
    query += ' AND p.is_active = ?';
    params.push(filters.status === 'active' ? 1 : 0);
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  
  let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
  const countParams = [];
  if (filters.search) { countQuery += ' AND (p.name LIKE ? OR p.slug LIKE ?)'; countParams.push(`%${filters.search}%`, `%${filters.search}%`); }
  if (filters.category_id) { countQuery += ' AND p.category_id = ?'; countParams.push(filters.category_id); }
  if (filters.status) { countQuery += ' AND p.is_active = ?'; countParams.push(filters.status === 'active' ? 1 : 0); }
  
  const [[{ total }]] = await pool.query(countQuery, countParams);

  // Fetch variants for each product
  const productIds = rows.map(r => r.id);
  if (productIds.length > 0) {
    const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id IN (?)', [productIds]);
    rows.forEach(row => {
      row.variants = variants.filter(v => v.product_id === row.id);
    });
  }

  return { products: rows, total, page, limit };
};

export const getProductById = async (id) => {
  const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  if (!products.length) return null;

  const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id = ?', [id]);
  const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [id]);
  
  return { ...products[0], variants, images };
};

// Simplified create - in a real app this uses a transaction for variants/images
export const createProduct = async (productData, userId) => {
  const { id, category_id, name, hindi_name, slug, origin, description, tag, packaging_key, is_active } = productData;
  await pool.query(
    'INSERT INTO products (id, category_id, name, hindi_name, slug, origin, description, tag, packaging_key, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, category_id, name, hindi_name || null, slug, origin, description, tag, packaging_key, is_active ?? true]
  );
  
  return await getProductById(id);
};

export const updateProduct = async (id, productData) => {
  const { category_id, name, hindi_name, slug, origin, description, tag, packaging_key, is_active } = productData;
  
  let updateFields = [];
  let params = [];
  
  if (category_id !== undefined) { updateFields.push('category_id = ?'); params.push(category_id); }
  if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
  if (hindi_name !== undefined) { updateFields.push('hindi_name = ?'); params.push(hindi_name); }
  if (slug !== undefined) { updateFields.push('slug = ?'); params.push(slug); }
  if (origin !== undefined) { updateFields.push('origin = ?'); params.push(origin); }
  if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
  if (tag !== undefined) { updateFields.push('tag = ?'); params.push(tag); }
  if (packaging_key !== undefined) { updateFields.push('packaging_key = ?'); params.push(packaging_key); }
  if (is_active !== undefined) { updateFields.push('is_active = ?'); params.push(is_active); }

  if (updateFields.length > 0) {
    params.push(id);
    const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.query(query, params);
  }

  return await getProductById(id);
};

export const deleteProduct = async (id) => {
  await pool.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return true;
};
