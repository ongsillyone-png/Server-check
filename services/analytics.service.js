const AnalyticsRepository = require('../repositories/analytics.repository');

class AnalyticsService {
  /**
   * Fetch core KPI stats for dashboard summary cards
   */
  static async getDashboardKPIs() {
    const avgSeconds = await AnalyticsRepository.getAverageInspectionTime();
    const summary = await AnalyticsRepository.getInspectionStatsSummary();
    const vmSummary = await AnalyticsRepository.getVmInspectionStatsSummary();

    const avgMinutes = avgSeconds > 0 ? (avgSeconds / 60).toFixed(1) : '0';
    const totalInspected = summary.total_inspections;
    const passRate = totalInspected > 0 
      ? ((summary.pass_count / totalInspected) * 100).toFixed(1) 
      : '100.0';

    const vmTotalInspected = vmSummary.total_inspections;
    const vmPassRate = vmTotalInspected > 0
      ? ((vmSummary.pass_count / vmTotalInspected) * 100).toFixed(1)
      : '100.0';

    return {
      avgWalkTimeMinutes: avgMinutes,
      activeServersCount: summary.active_servers_count,
      totalSessionsCount: summary.total_sessions_count,
      totalInspectionsCount: totalInspected,
      passRatePercent: passRate,
      failCount: summary.fail_count,
      warnCount: summary.warn_count,
      passCount: summary.pass_count,
      // VM KPIs
      vmPassRatePercent: vmPassRate,
      vmFailCount: vmSummary.fail_count
    };
  }

  /**
   * Fetch lists and trends structured for Apache ECharts visualization
   */
  static async getChartsData() {
    const topServers = await AnalyticsRepository.getTopServerFails(5);
    const topRacks = await AnalyticsRepository.getTopRackFails(5);
    const topRooms = await AnalyticsRepository.getTopRoomFails(5);
    const topInspectors = await AnalyticsRepository.getTopInspectors(5);
    const monthlyRaw = await AnalyticsRepository.getMonthlyInspectionRates();

    // Map Top Servers
    const serverCharts = {
      labels: topServers.map(s => s.server_name),
      values: topServers.map(s => Number(s.fail_count))
    };

    // Map Top Racks
    const rackCharts = {
      labels: topRacks.map(r => r.rack_name),
      values: topRacks.map(r => Number(r.fail_count))
    };

    // Map Top Rooms (Pie Chart format: [{ name: '...', value: 12 }])
    const roomCharts = topRooms.map(r => ({
      name: r.room_name,
      value: Number(r.fail_count)
    }));

    // Map Top Inspectors
    const inspectorCharts = {
      labels: topInspectors.map(u => u.user_name),
      values: topInspectors.map(u => Number(u.completed_sessions))
    };

    // Map Monthly Trends (Thai Month Names)
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const monthlyTrends = {
      months: thaiMonths,
      inspected: Array(12).fill(0),
      fails: Array(12).fill(0)
    };

    monthlyRaw.forEach(row => {
      const idx = Number(row.inspect_month) - 1;
      if (idx >= 0 && idx < 12) {
        monthlyTrends.inspected[idx] = Number(row.total_inspected);
        monthlyTrends.fails[idx] = Number(row.fail_count);
      }
    });

    return {
      topServers: serverCharts,
      topRacks: rackCharts,
      topRooms: roomCharts,
      topInspectors: inspectorCharts,
      monthlyTrends
    };
  }
}

module.exports = AnalyticsService;
