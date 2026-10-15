import pool from '../config/db.js';
import crypto from 'crypto';

export const getReviews = async (req, res) => {
  try {
    const { all } = req.query;
    let query = `
      SELECT r.*, 
             COALESCE(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), 'Patron') as customer_name,
             p.name as product_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
    `;
    if (!all) query += ' WHERE r.is_approved = TRUE';
    query += ' ORDER BY r.created_at DESC';
    
    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

export const createReview = async (req, res) => {
  try {
    const rating = req.body.rating;
    const comment = req.body.comment || req.body.review_text || req.body.content || '';
    const title = req.body.title || 'Patron Review';
    let productId = req.body.product_id || req.body.productId;

    if (!rating || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    if (!productId) {
      const [[firstProd]] = await pool.query('SELECT id FROM products LIMIT 1');
      productId = firstProd ? firstProd.id : null;
    }

    const id = crypto.randomUUID();
    let userId = req.user?.id;
    if (!userId) {
      const customerName = req.body.customer_name || req.body.name;
      if (customerName) {
        const guestId = crypto.randomUUID();
        try {
          await pool.query(
            `INSERT INTO users (id, email, first_name, role) VALUES (?, ?, ?, 'customer')`,
            [guestId, `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@naavori.com`, customerName.trim()]
          );
          userId = guestId;
        } catch {
          const [[firstUser]] = await pool.query('SELECT id FROM users LIMIT 1');
          userId = firstUser ? firstUser.id : id;
        }
      } else {
        const [[firstUser]] = await pool.query('SELECT id FROM users LIMIT 1');
        userId = firstUser ? firstUser.id : id;
      }
    }

    await pool.query(
      `INSERT INTO reviews (id, product_id, user_id, rating, title, comment, is_approved, created_at)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())`,
      [id, productId, userId, parseInt(rating), title, comment.trim()]
    );
    
    res.status(201).json({ success: true, message: 'Review submitted successfully', data: { id } });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Failed to create review' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};
