const DashboardService = require('../services/dashboard.service');

class DashboardController {
  // GET /dashboard
  static async showDashboard(req, res, next) {
    try {
      const summary = await DashboardService.getDashboardSummary();
      
      res.render('dashboard/index', {
        title: 'หน้าแรก / สรุปภาพรวมวันนี้ - Server Check',
        currentPage: 'dashboard',
        summary
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /dashboard/api/analytics (AJAX Endpoint for ECharts)
  static async getAnalytics(req, res, next) {
    try {
      const analytics = await DashboardService.getAnalyticsData();
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = DashboardController;
