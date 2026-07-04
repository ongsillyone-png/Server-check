const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

router.get('/', requireLogin, DashboardController.showDashboard);
router.get('/api/analytics', requireLogin, DashboardController.getAnalytics);

module.exports = router;
