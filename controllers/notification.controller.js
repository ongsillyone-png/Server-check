const NotificationService = require('../services/notification.service');

class NotificationController {
  /**
   * Render notifications list center web page
   * GET /notifications
   */
  static async listNotifications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await NotificationService.getPagedNotifications(page, limit);

      res.render('notifications/index', {
        title: 'ศูนย์การแจ้งเตือน - Server Check',
        currentPage: 'notifications',
        notifications: result.data,
        pagination: result.pagination,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get unread notification counts JSON
   * GET /notifications/api/unread-count
   */
  static async getUnreadCount(req, res, next) {
    try {
      const unreadCount = await NotificationService.getUnreadCount();
      res.json({ unreadCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Mark a specific notification as read
   * POST /notifications/api/:id/read
   */
  static async markAsRead(req, res, next) {
    try {
      const id = Number(req.params.id);
      await NotificationService.markAsRead(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Mark all unread notifications as read
   * POST /notifications/api/read-all
   */
  static async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Soft delete notification
   * POST /notifications/api/:id/delete
   */
  static async deleteNotification(req, res, next) {
    try {
      const id = Number(req.params.id);
      await NotificationService.deleteNotification(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = NotificationController;
