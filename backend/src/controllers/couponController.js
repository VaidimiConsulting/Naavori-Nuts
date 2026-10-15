import crypto from 'crypto';
import pool from '../config/db.js';

export const getAllCoupons = async (req, res) => {
  try {
    const [coupons] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, type, value, min_order_value, max_discount, expiry_date, usage_limit } = req.body;
    
    // Check if code exists
    const [existing] = await pool.query('SELECT id FROM coupons WHERE code = ?', [code.toUpperCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO coupons (id, code, type, value, min_order_value, max_discount, expiry_date, usage_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id, 
        code.toUpperCase(), 
        type, 
        value, 
        min_order_value || 0, 
        max_discount || null, 
        expiry_date || null, 
        usage_limit || null
      ]
    );
    
    res.status(201).json({ success: true, message: 'Coupon created successfully', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create coupon' });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    await pool.query('UPDATE coupons SET is_active = ? WHERE id = ?', [is_active, id]);
    res.json({ success: true, message: 'Coupon status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update coupon status' });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, cart_total } = req.body;
    if (!code || cart_total == null) return res.status(400).json({ success: false, message: 'Code and cart_total required' });

    const [coupons] = await pool.query('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [code.toUpperCase()]);
    if (coupons.length === 0) return res.status(400).json({ success: false, message: 'Invalid or inactive coupon code' });
    
    const coupon = coupons[0];
    
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    
    if (cart_total < coupon.min_order_value) {
        return res.status(400).json({ success: false, message: 'Minimum order value of ₹' + coupon.min_order_value + ' required' });
    }
    
    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = (cart_total * coupon.value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
        }
    } else {
        discount = coupon.value;
    }
    
    // discount shouldn't exceed cart total
    if (discount > cart_total) discount = cart_total;
    
    res.json({
      success: true,
      discount: Math.round(discount),
      coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value },
      data: { id: coupon.id, discount_amount: Math.round(discount), type: coupon.type, value: coupon.value }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to apply coupon' });
  }
};
