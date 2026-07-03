const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

router.get('/', requireLogin, ReportController.showReportPage);
router.get('/summary', requireLogin, ReportController.showSummary);

module.exports = router;
