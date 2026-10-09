import pool from '../config/db.js';
import crypto from 'crypto';

if (!global.crypto) global.crypto = crypto;

export const getReviews = async (req, res) => {
  try {
    const { all } = req.query; // Admin might request all, public requests only approved
    let query = 'SELECT * FROM reviews';
    if (!all) query += ' WHERE is_approved = true';
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

export const createReview = async (req, res) => {
  try {
    const { customer_name, rating, review_text } = req.body;
    if (!customer_name || !rating || !review_text) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO reviews (id, customer_name, rating, review_text) VALUES (?, ?, ?, ?)',
      [id, customer_name, parseInt(rating), review_text]
    );
    
    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create review' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};
