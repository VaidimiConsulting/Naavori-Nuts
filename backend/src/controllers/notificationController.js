import * as notifRepo from '../repositories/notificationRepository.js';

export const getNotifications = async (req, res) => {
  try {
    const list = await notifRepo.getNotifications(20);
    const unreadCount = list.filter(n => !n.is_read).length;
    res.json({
      success: true,
      data: {
        notifications: list,
        unread_count: unreadCount
      }
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await notifRepo.markRead(id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await notifRepo.markAllRead();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};
