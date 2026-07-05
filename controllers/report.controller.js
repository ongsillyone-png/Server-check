const ReportService = require('../services/report.service');

class ReportController {
  /**
   * Render main reports index dashboard page
   * GET /reports
   */
  static async showDashboard(req, res, next) {
    try {
      res.render('report/index', {
        title: 'ระบบออกรายงาน - Server Check',
        currentPage: 'reports'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render daily inspection report page
   * GET /reports/daily
   */
  static async showDailyReport(req, res, next) {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const data = await ReportService.getDailyReport(date);

      res.render('report/daily', {
        title: `รายงานการเดินตรวจประจำวัน (${date}) - Server Check`,
        currentPage: 'reports',
        date,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render monthly inspection report page
   * GET /reports/monthly
   */
  static async showMonthlyReport(req, res, next) {
    try {
      const year = req.query.year || new Date().getFullYear();
      const month = req.query.month || (new Date().getMonth() + 1);
      const data = await ReportService.getMonthlyReport(year, month);

      res.render('report/monthly', {
        title: `รายงานการเดินตรวจประจำเดือน (${month}/${year}) - Server Check`,
        currentPage: 'reports',
        year,
        month,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render yearly inspection report page
   * GET /reports/yearly
   */
  static async showYearlyReport(req, res, next) {
    try {
      const year = req.query.year || new Date().getFullYear();
      const data = await ReportService.getYearlyReport(year);

      res.render('report/yearly', {
        title: `รายงานการเดินตรวจประจำปี (${year}) - Server Check`,
        currentPage: 'reports',
        year,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render server check summary report page
   * GET /reports/server
   */
  static async showServerReport(req, res, next) {
    try {
      const data = await ReportService.getServerSummary();
      res.render('report/summary', {
        title: 'รายงานสรุปผลการเดินตรวจรายเครื่องเซิร์ฟเวอร์ - Server Check',
        currentPage: 'reports',
        summaryType: 'server',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render rack check summary report page
   * GET /reports/rack
   */
  static async showRackReport(req, res, next) {
    try {
      const data = await ReportService.getRackSummary();
      res.render('report/summary', {
        title: 'รายงานสรุปผลการเดินตรวจรายตู้แร็ค - Server Check',
        currentPage: 'reports',
        summaryType: 'rack',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render room check summary report page
   * GET /reports/room
   */
  static async showRoomReport(req, res, next) {
    try {
      const data = await ReportService.getRoomSummary();
      res.render('report/summary', {
        title: 'รายงานสรุปผลการเดินตรวจรายห้อง Server - Server Check',
        currentPage: 'reports',
        summaryType: 'room',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render VM check summary report page
   * GET /reports/vm
   */
  static async showVmReport(req, res, next) {
    try {
      const ReportService = require('../services/report.service');
      const data = await ReportService.getVmSummary();
      res.render('report/summary', {
        title: 'รายงานสรุปผลการเดินตรวจ Virtual Machines - Server Check',
        currentPage: 'reports',
        summaryType: 'vm',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render user check summary report page
   * GET /reports/user
   */
  static async showUserReport(req, res, next) {
    try {
      const data = await ReportService.getUserSummary();
      res.render('report/summary', {
        title: 'รายงานสรุปผลการเข้าปฏิบัติงานเดินตรวจรายบุคคล - Server Check',
        currentPage: 'reports',
        summaryType: 'user',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Stream report data as Excel/CSV with Thai BOM
   * GET /reports/export
   */
  static async exportReportCSV(req, res, next) {
    try {
      const type = req.query.type;
      if (!type) throw new Error('กรุณาระบุประเภทรายงานที่ต้องการดาวน์โหลด');

      const { headers, rows } = await ReportService.getExportCSVData(type, req.query);

      const csvLines = [];
      // Prepend BOM (\uFEFF) for Excel Thai character support
      csvLines.push('\uFEFF' + headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

      rows.forEach(row => {
        const line = headers.map(header => {
          const val = String(row[header] === null || row[header] === undefined ? '' : row[header]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',');
        csvLines.push(line);
      });

      const csvString = csvLines.join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.csv`);
      res.send(csvString);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportController;
