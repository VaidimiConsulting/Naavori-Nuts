import Razorpay from 'razorpay';
import crypto from 'crypto';
import db from '../config/db.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, 
      userEmail,
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE orders SET payment_status = 'paid', order_status = 'confirmed' WHERE id = ?`,
        [orderId]
      );

      const [orderRows] = await connection.query(
        `SELECT * FROM orders WHERE id = ?`,
        [orderId]
      );

      await connection.commit();
      connection.release();

      if (orderRows.length > 0 && userEmail) {
        await sendOrderConfirmationEmail(orderRows[0], userEmail);
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified and order confirmed successfully',
      });
    } catch (dbErr) {
      await connection.rollback();
      connection.release();
      throw dbErr;
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
  }
};
