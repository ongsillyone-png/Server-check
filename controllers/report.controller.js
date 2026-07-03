class ReportController {
  // GET /reports
  static showReportPage(req, res) {
    res.render('report/index', {
      title: 'Report Management - Server Check',
      currentPage: 'reports'
    });
  }

  // GET /reports/summary
  static showSummary(req, res) {
    res.render('report/summary', {
      title: 'Inspection Summary Report - Server Check',
      currentPage: 'reports',
      layout: false // Do not use main layout for print view
    });
  }
}

module.exports = ReportController;
