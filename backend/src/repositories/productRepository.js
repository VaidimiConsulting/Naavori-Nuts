import pool from '../config/db.js';
import crypto from 'crypto';

export const getAllProducts = async (filters, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      p.id, p.name, p.hindi_name, p.slug, p.origin, p.description, p.tag, p.rating, p.packaging_key, p.is_active, p.created_at,
      p.category_id,
      c.name as category_name,
      c.slug as category_slug,
      (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as starting_price,
      (SELECT SUM(stock) FROM product_variants WHERE product_id = p.id) as total_stock,
      (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) as image_url
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.search) {
    query += ' AND (p.name LIKE ? OR p.slug LIKE ? OR p.hindi_name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.category_id && filters.category_id !== 'all') {
    query += ' AND (p.category_id = ? OR c.slug = ? OR c.name = ?)';
    params.push(filters.category_id, filters.category_id, filters.category_id);
  }
  if (filters.status) {
    query += ' AND p.is_active = ?';
    params.push(filters.status === 'active' ? 1 : 0);
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const countParams = [];
  if (filters.search) { 
    countQuery += ' AND (p.name LIKE ? OR p.slug LIKE ? OR p.hindi_name LIKE ?)'; 
    countParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`); 
  }
  if (filters.category_id && filters.category_id !== 'all') { 
    countQuery += ' AND (p.category_id = ? OR c.slug = ? OR c.name = ?)'; 
    countParams.push(filters.category_id, filters.category_id, filters.category_id); 
  }
  if (filters.status) { 
    countQuery += ' AND p.is_active = ?'; 
    countParams.push(filters.status === 'active' ? 1 : 0); 
  }
  
  const [[{ total }]] = await pool.query(countQuery, countParams);

  // Fetch variants for each product
  const productIds = rows.map(r => r.id);
  if (productIds.length > 0) {
    const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id IN (?) ORDER BY price ASC', [productIds]);
    rows.forEach(row => {
      row.variants = variants.filter(v => v.product_id === row.id);
    });
  }

  return { products: rows, total, page, limit };
};

export const getProductById = async (id) => {
  const [products] = await pool.query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `, [id]);
  if (!products.length) return null;

  const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id = ? ORDER BY price ASC', [id]);
  const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [id]);
  
  return { ...products[0], variants, images };
};

export const createProduct = async (productData, userId) => {
  const { id, category_id, name, hindi_name, slug, origin, description, tag, packaging_key, is_active, variants } = productData;
  const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  await pool.query(
    'INSERT INTO products (id, category_id, name, hindi_name, slug, origin, description, tag, packaging_key, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, category_id, name, hindi_name || null, cleanSlug, origin, description, tag, packaging_key || cleanSlug, is_active ?? true]
  );
  
  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (v.price !== undefined && v.price !== null && v.price !== '') {
        const vid = crypto.randomUUID();
        const weightLabel = (v.weight_label || '250g').trim();
        const cleanSku = v.sku?.trim() || `${cleanSlug.toUpperCase().slice(0, 4)}-${weightLabel.replace(/\s+/g, '')}-${vid.slice(0, 4)}`;
        await pool.query(
          'INSERT INTO product_variants (id, product_id, weight_label, price, compare_at_price, sku, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [vid, id, weightLabel, Number(v.price), v.compare_at_price ? Number(v.compare_at_price) : null, cleanSku, v.stock ? Number(v.stock) : 50]
        );
      }
    }
  }

  return await getProductById(id);
};

export const updateProductPricing = async (productId, variants) => {
  const [products] = await pool.query('SELECT id, slug, name FROM products WHERE id = ?', [productId]);
  if (!products.length) throw new Error('Product not found');
  const slug = products[0].slug || products[0].name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const [existingVariants] = await pool.query('SELECT id, weight_label, sku, stock FROM product_variants WHERE product_id = ?', [productId]);
  const existingMap = new Map();
  for (const ev of existingVariants) {
    existingMap.set(ev.weight_label.toLowerCase().trim(), ev);
  }

  const keptVariantIds = new Set();

  for (const v of variants) {
    if (v.price === undefined || v.price === null || v.price === '') continue;
    const weightLabel = (v.weight_label || '250g').trim();
    const existingById = v.id ? existingVariants.find(ev => ev.id === v.id) : null;
    const existing = existingById || existingMap.get(weightLabel.toLowerCase());
    const numericPrice = Number(v.price);
    const comparePrice = v.compare_at_price ? Number(v.compare_at_price) : null;
    const stockVal = v.stock !== undefined && v.stock !== null ? Number(v.stock) : (existing?.stock ?? 50);

    if (existing) {
      const sku = v.sku?.trim() || existing.sku;
      await pool.query(
        'UPDATE product_variants SET weight_label = ?, price = ?, compare_at_price = ?, sku = ?, stock = ? WHERE id = ?',
        [weightLabel, numericPrice, comparePrice, sku, stockVal, existing.id]
      );
      keptVariantIds.add(existing.id);
    } else {
      const vid = crypto.randomUUID();
      const sku = v.sku?.trim() || `${slug.toUpperCase().slice(0, 4)}-${weightLabel.replace(/\s+/g, '')}-${vid.slice(0, 4)}`;
      await pool.query(
        'INSERT INTO product_variants (id, product_id, weight_label, price, compare_at_price, sku, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [vid, productId, weightLabel, numericPrice, comparePrice, sku, stockVal]
      );
      keptVariantIds.add(vid);
    }
  }

  // Remove any variants that are no longer in the list
  for (const ev of existingVariants) {
    if (!keptVariantIds.has(ev.id)) {
      try {
        await pool.query('DELETE FROM product_variants WHERE id = ?', [ev.id]);
      } catch (err) {
        console.warn('Could not delete unselected variant due to relationship:', err.message);
      }
    }
  }

  return await getProductById(productId);
};

export const updateProduct = async (id, productData) => {
  const { category_id, name, hindi_name, slug, origin, description, tag, packaging_key, is_active, variants } = productData;
  
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

  if (variants && Array.isArray(variants)) {
    await updateProductPricing(id, variants);
  }

  return await getProductById(id);
};

export const deleteProduct = async (id) => {
  await pool.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return true;
};

