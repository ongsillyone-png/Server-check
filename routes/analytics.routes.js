const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

// View page for executive dashboard
router.get('/', requireLogin, AnalyticsController.showExecutiveDashboard);

// API endpoint to load AJAX datasets for Apache ECharts
router.get('/api/charts-data', requireLogin, AnalyticsController.getChartsData);

module.exports = router;
