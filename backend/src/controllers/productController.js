import * as productRepository from '../repositories/productRepository.js';
import crypto from 'crypto';

if (!global.crypto) {
  global.crypto = crypto;
}

export const getProducts = async (req, res) => {
  try {
    const { search, category_id, status, page, limit } = req.query;
    
    const result = await productRepository.getAllProducts(
      { search, category_id, status }, 
      parseInt(page) || 1, 
      parseInt(limit) || 20
    );

    res.json({ success: true, data: result.products, meta: { total: result.total, page: result.page, limit: result.limit } });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const product = await productRepository.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const id = crypto.randomUUID();
    const product = await productRepository.createProduct({ id, ...req.body }, req.user.id);
    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }
  // Return URL that frontend can directly use
  const imageUrl = `/uploads/products/${req.file.filename}`;
  try {
    const { product_id, slug } = req.body;
    let targetProductId = product_id;
    if (!targetProductId && slug) {
      const pool = (await import('../config/db.js')).default;
      const [p] = await pool.query('SELECT id FROM products WHERE slug = ?', [slug]);
      if (p.length > 0) targetProductId = p[0].id;
    }
    if (targetProductId) {
      const pool = (await import('../config/db.js')).default;
      const imgId = crypto.randomUUID();
      await pool.query(
        'INSERT INTO product_images (id, product_id, image_url, sort_order) VALUES (?, ?, ?, 0)',
        [imgId, targetProductId, imageUrl]
      );
    }
  } catch (err) {
    console.warn('Image DB link note:', err.message);
  }

  res.json({ 
    success: true, 
    message: 'Image uploaded successfully', 
    filename: req.file.filename,
    url: imageUrl
  });
};

export const updateProduct = async (req, res) => {
  try {
    const product = await productRepository.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product, message: 'Product updated' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const updatePricing = async (req, res) => {
  try {
    const { variants } = req.body;
    if (!variants || !Array.isArray(variants)) {
      return res.status(400).json({ success: false, message: 'Variants array is required' });
    }
    const product = await productRepository.updateProductPricing(req.params.id, variants);
    res.json({ success: true, data: product, message: 'Product prices updated successfully' });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update pricing' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await productRepository.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};
