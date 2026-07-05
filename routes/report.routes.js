const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

// Web Views
router.get('/', requireLogin, ReportController.showDashboard);
router.get('/daily', requireLogin, ReportController.showDailyReport);
router.get('/monthly', requireLogin, ReportController.showMonthlyReport);
router.get('/yearly', requireLogin, ReportController.showYearlyReport);
router.get('/server', requireLogin, ReportController.showServerReport);
router.get('/rack', requireLogin, ReportController.showRackReport);
router.get('/room', requireLogin, ReportController.showRoomReport);
router.get('/user', requireLogin, ReportController.showUserReport);
router.get('/vm', requireLogin, ReportController.showVmReport);

// Exports
router.get('/export', requireLogin, ReportController.exportReportCSV);

module.exports = router;
