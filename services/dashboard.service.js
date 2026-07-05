const DashboardRepository = require('../repositories/dashboard.repository');

class DashboardService {
  /**
   * Helper to format Date object into local MySQL datetime string (YYYY-MM-DD HH:mm:ss)
   */
  static _formatLocalMySQLDateTime(d) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  /**
   * Helper to get status statistics (Pass, Fail, Warning, Pending) for a given timeframe
   */
  static async _getStatsForPeriod(startDate, endDate, totalServers) {
    const startStr = this._formatLocalMySQLDateTime(startDate);
    const endStr = this._formatLocalMySQLDateTime(endDate);

    const rows = await DashboardRepository.getInspectionStatsForPeriod(startStr, endStr);

    let pass = 0;
    let warning = 0;
    let fail = 0;

    rows.forEach(r => {
      if (r.status === 'pass') pass = Number(r.count);
      else if (r.status === 'warning') warning = Number(r.count);
      else if (r.status === 'fail') fail = Number(r.count);
    });

    const pending = Math.max(0, totalServers - (pass + warning + fail));

    return { pass, warning, fail, pending };
  }

  /**
   * Helper to get VM status statistics for a given timeframe
   */
  static async _getVmStatsForPeriod(startDate, endDate, totalVms) {
    const startStr = this._formatLocalMySQLDateTime(startDate);
    const endStr = this._formatLocalMySQLDateTime(endDate);

    const rows = await DashboardRepository.getVmInspectionStatsForPeriod(startStr, endStr);

    let pass = 0, warning = 0, fail = 0;
    rows.forEach(r => {
      if (r.status === 'pass') pass = Number(r.count);
      else if (r.status === 'warning') warning = Number(r.count);
      else if (r.status === 'fail') fail = Number(r.count);
    });
    const pending = Math.max(0, totalVms - (pass + warning + fail));
    return { pass, warning, fail, pending };
  }

  /**
   * Fetch summary metrics for dashboard UI cards & lists
   */
  static async getDashboardSummary() {
    const today = new Date();

    // Today range
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // This Month range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // This Year range
    const yearStart = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Fetch baseline asset counts
    const assets = await DashboardRepository.getAssetsCounts();
    const totalServers = assets.servers;
    const totalVms = assets.vms;

    // Fetch Physical + VM stats in parallel
    const [
      todayStats, monthStats, yearStats, latestSessions,
      vmTodayStats, vmMonthStats, vmYearStats, vmLatestSessions
    ] = await Promise.all([
      this._getStatsForPeriod(todayStart, todayEnd, totalServers),
      this._getStatsForPeriod(monthStart, monthEnd, totalServers),
      this._getStatsForPeriod(yearStart, yearEnd, totalServers),
      DashboardRepository.getLatestInspectionSessions(5),
      this._getVmStatsForPeriod(todayStart, todayEnd, totalVms),
      this._getVmStatsForPeriod(monthStart, monthEnd, totalVms),
      this._getVmStatsForPeriod(yearStart, yearEnd, totalVms),
      DashboardRepository.getLatestVmInspectionSessions(5)
    ]);

    return {
      assets,
      todayStats, monthStats, yearStats, latestSessions,
      vmTodayStats, vmMonthStats, vmYearStats, vmLatestSessions
    };
  }

  /**
   * Fetch all analytics trend logs & distributions for ECharts render
   */
  static async getAnalyticsData() {
    const [
      dailyTrends,
      monthlyTrends,
      topRooms,
      topRacks,
      topServers,
      checklistDistribution
    ] = await Promise.all([
      DashboardRepository.getDailyTrends(30),
      DashboardRepository.getMonthlyTrends(12),
      DashboardRepository.getTopFailedRooms(5),
      DashboardRepository.getTopFailedRacks(5),
      DashboardRepository.getTopFailedServers(5),
      DashboardRepository.getChecklistItemResultsDistribution()
    ]);

    return {
      dailyTrends,
      monthlyTrends,
      topRooms,
      topRacks,
      topServers,
      checklistDistribution
    };
  }
}

module.exports = DashboardService;
