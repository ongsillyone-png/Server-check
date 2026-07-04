const BaseRepository = require('./base.repository');

class ReportRepository extends BaseRepository {
  /**
   * Fetch all server inspections completed on a specific day
   */
  static async getDailyReportData(dateStr) {
    const sql = `
      SELECT 
        s.id as session_id, 
        s.completed_at, 
        u.name as inspector_name,
        d.id as detail_id, 
        ps.server_name, 
        rm.room_name, 
        r.rack_name, 
        d.overall_status, 
        d.server_remark, 
        d.inspected_at
      FROM inspection_sessions s
      INNER JOIN users u ON s.user_id = u.id
      INNER JOIN inspection_details d ON d.session_id = s.id
      INNER JOIN physical_servers ps ON d.server_id = ps.id
      INNER JOIN racks r ON ps.rack_id = r.id
      INNER JOIN rooms rm ON r.room_id = rm.id
      WHERE DATE(s.completed_at) = ? AND s.status = 'completed'
      ORDER BY s.completed_at DESC, rm.room_name, r.rack_name, ps.server_name
    `;
    return await this.query(sql, [dateStr]);
  }

  /**
   * Fetch daily aggregated walkthrough inspections in a specific month
   */
  static async getMonthlyReportData(year, month) {
    const sql = `
      SELECT 
        DATE(d.inspected_at) as inspect_date,
        COUNT(DISTINCT d.session_id) as total_sessions,
        COUNT(d.id) as total_inspected,
        SUM(CASE WHEN d.overall_status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.overall_status = 'warning' THEN 1 ELSE 0 END) as warn_count,
        SUM(CASE WHEN d.overall_status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_details d
      INNER JOIN inspection_sessions s ON d.session_id = s.id
      WHERE YEAR(d.inspected_at) = ? 
        AND MONTH(d.inspected_at) = ?
        AND s.status = 'completed'
      GROUP BY DATE(d.inspected_at)
      ORDER BY inspect_date
    `;
    return await this.query(sql, [parseInt(year), parseInt(month)]);
  }

  /**
   * Fetch monthly aggregated walkthrough inspections in a specific year
   */
  static async getYearlyReportData(year) {
    const sql = `
      SELECT 
        MONTH(d.inspected_at) as inspect_month,
        COUNT(DISTINCT d.session_id) as total_sessions,
        COUNT(d.id) as total_inspected,
        SUM(CASE WHEN d.overall_status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.overall_status = 'warning' THEN 1 ELSE 0 END) as warn_count,
        SUM(CASE WHEN d.overall_status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_details d
      INNER JOIN inspection_sessions s ON d.session_id = s.id
      WHERE YEAR(d.inspected_at) = ?
        AND s.status = 'completed'
      GROUP BY MONTH(d.inspected_at)
      ORDER BY inspect_month
    `;
    return await this.query(sql, [parseInt(year)]);
  }

  /**
   * Fetch summary check statistics for all active physical servers
   */
  static async getServerSummaryData() {
    const sql = `
      SELECT 
        ps.id as server_id,
        ps.server_name,
        ps.model,
        ps.ip_address,
        r.rack_name,
        rm.room_name,
        COUNT(d.id) as total_inspected,
        SUM(CASE WHEN d.overall_status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.overall_status = 'warning' THEN 1 ELSE 0 END) as warn_count,
        SUM(CASE WHEN d.overall_status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM physical_servers ps
      INNER JOIN racks r ON ps.rack_id = r.id
      INNER JOIN rooms rm ON r.room_id = rm.id
      LEFT JOIN inspection_details d ON ps.id = d.server_id
      LEFT JOIN inspection_sessions s ON d.session_id = s.id AND s.status = 'completed'
      WHERE ps.status = 'active'
      GROUP BY ps.id, ps.server_name, ps.model, ps.ip_address, r.rack_name, rm.room_name
      ORDER BY rm.room_name, r.rack_name, ps.server_name
    `;
    return await this.query(sql);
  }

  /**
   * Fetch summary check statistics grouped by Racks
   */
  static async getRackSummaryData() {
    const sql = `
      SELECT 
        r.id as rack_id,
        r.rack_name,
        rm.room_name,
        COUNT(d.id) as total_inspected,
        SUM(CASE WHEN d.overall_status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.overall_status = 'warning' THEN 1 ELSE 0 END) as warn_count,
        SUM(CASE WHEN d.overall_status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM racks r
      INNER JOIN rooms rm ON r.room_id = rm.id
      LEFT JOIN physical_servers ps ON ps.rack_id = r.id AND ps.status = 'active'
      LEFT JOIN inspection_details d ON ps.id = d.server_id
      LEFT JOIN inspection_sessions s ON d.session_id = s.id AND s.status = 'completed'
      GROUP BY r.id, r.rack_name, rm.room_name
      ORDER BY rm.room_name, r.rack_name
    `;
    return await this.query(sql);
  }

  /**
   * Fetch summary check statistics grouped by Rooms
   */
  static async getRoomSummaryData() {
    const sql = `
      SELECT 
        rm.id as room_id,
        rm.room_name,
        rm.building,
        rm.floor,
        COUNT(d.id) as total_inspected,
        SUM(CASE WHEN d.overall_status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.overall_status = 'warning' THEN 1 ELSE 0 END) as warn_count,
        SUM(CASE WHEN d.overall_status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM rooms rm
      LEFT JOIN racks r ON r.room_id = rm.id
      LEFT JOIN physical_servers ps ON ps.rack_id = r.id AND ps.status = 'active'
      LEFT JOIN inspection_details d ON ps.id = d.server_id
      LEFT JOIN inspection_sessions s ON d.session_id = s.id AND s.status = 'completed'
      GROUP BY rm.id, rm.room_name, rm.building, rm.floor
      ORDER BY rm.room_name
    `;
    return await this.query(sql);
  }

  /**
   * Fetch walking session counts completed by each user/inspector
   */
  static async getUserSummaryData() {
    const sql = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.username,
        r.role_name,
        COUNT(s.id) as completed_sessions
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN inspection_sessions s ON u.id = s.user_id AND s.status = 'completed'
      GROUP BY u.id, u.name, u.username, r.role_name
      ORDER BY completed_sessions DESC, u.name
    `;
    return await this.query(sql);
  }
}

module.exports = ReportRepository;
