import * as supportRepo from '../repositories/supportRepository.js';
import * as userRepo from '../repositories/userRepository.js';
import crypto from 'crypto';
import { 
  sendInquiryAdminAlert, 
  sendInquiryCustomerAcknowledgment, 
  sendTicketReplyCustomerEmail 
} from '../utils/emailService.js';

export const createTicket = async (req, res) => {
  try {
    const { order_id, subject, message, name, email } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    let userId = req.user?.id;
    let customerEmail = email;
    let customerName = name;

    if (!userId) {
      if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide an email address' });
      }
      const existing = await userRepo.findUserByEmail(email);
      if (existing) {
        userId = existing.id;
        customerName = customerName || existing.first_name;
      } else {
        const id = crypto.randomUUID();
        const created = await userRepo.createUser({
          id,
          email,
          first_name: name || 'Guest Patron',
          role: 'customer'
        });
        userId = created.id;
        customerName = customerName || 'Guest Patron';
      }
    } else {
      customerEmail = customerEmail || req.user.email;
      customerName = customerName || req.user.first_name || 'Valued Patron';
    }

    const ticketId = await supportRepo.createTicket({
      user_id: userId,
      order_id,
      subject,
      message
    });

    // 1. Notify store owner at info@naavori.in immediately
    sendInquiryAdminAlert({
      name: customerName,
      email: customerEmail,
      subject,
      message,
      order_id
    }).catch(err => console.error('Store inquiry alert note:', err.message));

    // 2. Send automated acknowledgment to customer
    if (customerEmail) {
      sendInquiryCustomerAcknowledgment({
        name: customerName,
        email: customerEmail,
        subject
      }).catch(err => console.error('Customer inquiry ack note:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent to our concierge team. We will review and reply promptly.',
      data: { ticketId }
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to create support ticket' });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const tickets = await supportRepo.getAllTickets({ status });
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

export const getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await supportRepo.getTicketById(id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error fetching ticket detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket detail' });
  }
};

export const addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
    }

    const replyId = await supportRepo.addTicketReply({
      ticket_id: id,
      sender_id: req.user.id,
      message: message.trim()
    });

    // If staff/admin replied, email the customer directly
    try {
      const ticket = await supportRepo.getTicketById(id);
      if (ticket && ticket.user_email && (req.user.role === 'admin' || req.user.role === 'owner')) {
        sendTicketReplyCustomerEmail(ticket, message.trim(), ticket.user_email).catch(e =>
          console.error('Ticket reply customer email note:', e.message)
        );
      }
    } catch (e) {
      console.warn('Reply email lookup note:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: { replyId }
    });
  } catch (error) {
    console.error('Error adding ticket reply:', error);
    res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['open', 'in_progress', 'resolved', 'closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket status' });
    }

    await supportRepo.updateTicketStatus(id, status);
    res.json({ success: true, message: `Ticket status updated to ${status}` });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket status' });
  }
};
