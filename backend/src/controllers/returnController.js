import * as returnRepo from '../repositories/returnRepository.js';
import * as orderRepo from '../repositories/orderRepository.js';

export const createReturnRequest = async (req, res) => {
  try {
    const { order_id, reason, items } = req.body;

    if (!order_id || !reason) {
      return res.status(400).json({ success: false, message: 'Order ID and return reason are required' });
    }

    const order = await orderRepo.getOrderById(order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const userId = req.user?.id || order.user_id || 'guest';
    const returnId = await returnRepo.createReturnRequest({
      order_id,
      user_id: userId,
      reason,
      items: items || []
    });

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully. Our concierge team will review it.',
      data: { returnId }
    });
  } catch (error) {
    console.error('Error submitting return request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit return request' });
  }
};

export const getReturns = async (req, res) => {
  try {
    const { status } = req.query;
    const list = await returnRepo.getAllReturns({ status });
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch returns' });
  }
};

export const getReturnDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await returnRepo.getReturnById(id);
    if (!details) return res.status(404).json({ success: false, message: 'Return request not found' });
    res.json({ success: true, data: details });
  } catch (error) {
    console.error('Error fetching return detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch return details' });
  }
};

export const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_comment } = req.body;

    const allowed = ['pending', 'approved', 'rejected', 'received', 'refunded', 'replaced'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid return status' });
    }

    await returnRepo.updateReturnStatus(id, { status, admin_comment });
    res.json({ success: true, message: `Return status updated to ${status}` });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ success: false, message: 'Failed to update return status' });
  }
};

export const processRefund = async (req, res) => {
  try {
    const { id } = req.params; // return_request_id
    const { order_id, amount, method, transaction_id } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid refund amount is required' });
    }

    const refundId = await returnRepo.recordRefund({
      order_id,
      return_request_id: id,
      amount,
      method,
      transaction_id
    });

    res.json({
      success: true,
      message: 'Refund recorded and processed successfully',
      data: { refundId }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
};
