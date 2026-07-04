const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

// Notification Center Web Views
router.get('/', requireLogin, NotificationController.listNotifications);

// API Endpoints for Ajax
router.get('/api/unread-count', requireLogin, NotificationController.getUnreadCount);
router.post('/api/:id/read', requireLogin, NotificationController.markAsRead);
router.post('/api/read-all', requireLogin, NotificationController.markAllAsRead);
router.post('/api/:id/delete', requireLogin, NotificationController.deleteNotification);

module.exports = router;
