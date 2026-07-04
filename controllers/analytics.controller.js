const AnalyticsService = require('../services/analytics.service');

class AnalyticsController {
  /**
   * Render Executive Dashboard view page
   * GET /analytics
   */
  static async showExecutiveDashboard(req, res, next) {
    try {
      const kpis = await AnalyticsService.getDashboardKPIs();
      res.render('analytics/dashboard', {
        title: 'แดชบอร์ดผู้บริหาร (KPI) - Server Check',
        currentPage: 'analytics',
        kpis
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * JSON API for Apache ECharts data loading
   * GET /analytics/api/charts-data
   */
  static async getChartsData(req, res, next) {
    try {
      const data = await AnalyticsService.getChartsData();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = AnalyticsController;
