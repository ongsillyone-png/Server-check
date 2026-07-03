class DashboardController {
  // GET /dashboard
  static showDashboard(req, res) {
    res.render('dashboard/index', {
      title: 'Dashboard - Server Check',
      currentPage: 'dashboard'
    });
  }

  // GET /api/dashboard/summary (API Placeholder)
  static getSummary(req, res) {
    res.json({ message: 'Dashboard summary API data scaffold' });
  }
}

module.exports = DashboardController;
