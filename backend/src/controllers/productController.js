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

export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }
  // Return URL that frontend can directly use
  const imageUrl = `/uploads/products/${req.file.filename}`;
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

export const deleteProduct = async (req, res) => {
  try {
    await productRepository.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};
