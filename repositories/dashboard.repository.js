const BaseRepository = require('./base.repository');

class DashboardRepository extends BaseRepository {
  /**
   * Get total counts of assets in the system
   */
  static async getAssetsCounts() {
    const roomsSql = 'SELECT COUNT(*) as count FROM rooms WHERE deleted_at IS NULL';
    const racksSql = 'SELECT COUNT(*) as count FROM racks WHERE deleted_at IS NULL';
    const serversSql = 'SELECT COUNT(*) as count FROM physical_servers WHERE deleted_at IS NULL';
    const vmsSql = 'SELECT COUNT(*) as count FROM virtual_machines WHERE deleted_at IS NULL';

    const [rooms, racks, servers, vms] = await Promise.all([
      this.query(roomsSql),
      this.query(racksSql),
      this.query(serversSql),
      this.query(vmsSql)
    ]);

    return {
      rooms: Number(rooms[0].count),
      racks: Number(racks[0].count),
      servers: Number(servers[0].count),
      vms: Number(vms[0].count)
    };
  }

  /**
   * Get total active servers count
   */
  static async getActiveServersCount() {
    const sql = 'SELECT COUNT(*) as count FROM physical_servers WHERE deleted_at IS NULL';
    const res = await this.query(sql);
    return Number(res[0].count);
  }

  /**
   * Get inspection status counts (Pass, Fail, Warning) in a given timeframe (completed sessions only)
   * @param {string} startDateStr - YYYY-MM-DD HH:mm:ss
   * @param {string} endDateStr - YYYY-MM-DD HH:mm:ss
   */
  static async getInspectionStatsForPeriod(startDateStr, endDateStr) {
    const sql = `
      SELECT d.status, COUNT(*) as count
      FROM inspection_details d
      INNER JOIN inspection_sessions s ON d.session_id = s.id
      INNER JOIN (
          SELECT d2.physical_server_id, MAX(s2.completed_at) as max_completed_at
          FROM inspection_details d2
          INNER JOIN inspection_sessions s2 ON d2.session_id = s2.id
          WHERE s2.status = 'completed'
            AND s2.deleted_at IS NULL
            AND d2.deleted_at IS NULL
            AND s2.completed_at >= ?
            AND s2.completed_at <= ?
          GROUP BY d2.physical_server_id
      ) latest ON d.physical_server_id = latest.physical_server_id 
        AND s.completed_at = latest.max_completed_at
      WHERE s.status = 'completed'
        AND s.deleted_at IS NULL
        AND d.deleted_at IS NULL
      GROUP BY d.status
    `;
    return await this.query(sql, [startDateStr, endDateStr]);
  }

  /**
   * Get daily trends of checks (Pass, Warning, Fail) for last N days
   */
  static async getDailyTrends(days = 30) {
    const sql = `
      SELECT 
        DATE(s.completed_at) as date,
        SUM(CASE WHEN d.status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_details d
      INNER JOIN inspection_sessions s ON d.session_id = s.id
      WHERE s.status = 'completed'
        AND s.deleted_at IS NULL
        AND d.deleted_at IS NULL
        AND s.completed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(s.completed_at)
      ORDER BY DATE(s.completed_at) ASC
    `;
    return await this.query(sql, [parseInt(days)]);
  }

  /**
   * Get monthly trends of checks for last N months
   */
  static async getMonthlyTrends(months = 12) {
    const sql = `
      SELECT 
        DATE_FORMAT(s.completed_at, '%Y-%m') as month,
        SUM(CASE WHEN d.status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_details d
      INNER JOIN inspection_sessions s ON d.session_id = s.id
      WHERE s.status = 'completed'
        AND s.deleted_at IS NULL
        AND d.deleted_at IS NULL
        AND s.completed_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(s.completed_at, '%Y-%m')
      ORDER BY DATE_FORMAT(s.completed_at, '%Y-%m') ASC
    `;
    return await this.query(sql, [parseInt(months)]);
  }

  /**
   * Get top rooms with failures (Fail/Warning)
   */
  static async getTopFailedRooms(limit = 5) {
    const sql = `
      SELECT 
        r.id as room_id,
        r.room_name,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count,
        SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
        COUNT(d.id) as total_inspections
      FROM inspection_details d
      INNER JOIN physical_servers ps ON d.physical_server_id = ps.id
      INNER JOIN racks rk ON ps.rack_id = rk.id
      INNER JOIN rooms r ON rk.room_id = r.id
      INNER JOIN inspection_sessions s ON d.session_id = s.id
      WHERE s.status = 'completed'
        AND s.deleted_at IS NULL
        AND d.deleted_at IS NULL
        AND ps.deleted_at IS NULL
        AND rk.deleted_at IS NULL
        AND r.deleted_at IS NULL
      GROUP BY r.id, r.room_name
      HAVING fail_count > 0 OR warning_count > 0
      ORDER BY fail_count DESC, warning_count DESC, total_inspections DESC
      LIMIT ?
    `;
    return await this.query(sql, [parseInt(limit)]);
  }

  /**
   * Get top racks with failures (Fail/Warning)
   */
  static async getTopFailedRacks(limit = 5) {
    const sql = `
      SELECT 
        rk.id as rack_id,
        rk.rack_name,
        r.room_name,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count,
        SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
        COUNT(d.id) as total_inspections
      FROM inspection_details d
      INNER JOIN physical_servers ps ON d.physical_server_id = ps.id
      INNER JOIN racks rk ON ps.rack_id = rk.id
      INNER JOIN rooms r ON rk.room_id = r.id
      INNER JOIN inspection_sessions s ON d.session_id = s.id
      WHERE s.status = 'completed'
        AND s.deleted_at IS NULL
        AND d.deleted_at IS NULL
        AND ps.deleted_at IS NULL
        AND rk.deleted_at IS NULL
        AND r.deleted_at IS NULL
      GROUP BY rk.id, rk.rack_name, r.room_name
      HAVING fail_count > 0 OR warning_count > 0
      ORDER BY fail_count DESC, warning_count DESC, total_inspections DESC
      LIMIT ?
    `;
    return await this.query(sql, [parseInt(limit)]);
  }

  /**
   * Get top physical servers with failures (Fail/Warning)
   */
  static async getTopFailedServers(limit = 5) {
    const sql = `
      SELECT 
        ps.id as server_id,
        ps.server_name,
        rk.rack_name,
        r.room_name,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count,
        SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
        COUNT(d.id) as total_inspections
      FROM inspection_details d
      INNER JOIN physical_servers ps ON d.physical_server_id = ps.id
      INNER JOIN racks rk ON ps.rack_id = rk.id
      INNER JOIN rooms r ON rk.room_id = r.id
      INNER JOIN inspection_sessions s ON d.session_id = s.id
      WHERE s.status = 'completed'
        AND s.deleted_at IS NULL
        AND d.deleted_at IS NULL
        AND ps.deleted_at IS NULL
        AND rk.deleted_at IS NULL
        AND r.deleted_at IS NULL
      GROUP BY ps.id, ps.server_name, rk.rack_name, r.room_name
      HAVING fail_count > 0 OR warning_count > 0
      ORDER BY fail_count DESC, warning_count DESC, total_inspections DESC
      LIMIT ?
    `;
    return await this.query(sql, [parseInt(limit)]);
  }

  /**
   * Get individual checklist results distribution (Pass, Fail, N/A) for Pie Chart
   */
  static async getChecklistItemResultsDistribution() {
    const sql = `
      SELECT 
        ir.result_value,
        COUNT(*) as count
      FROM inspection_results ir
      INNER JOIN inspection_details id ON ir.detail_id = id.id
      INNER JOIN inspection_sessions s ON id.session_id = s.id
      WHERE s.status = 'completed'
        AND s.deleted_at IS NULL
        AND id.deleted_at IS NULL
        AND ir.deleted_at IS NULL
      GROUP BY ir.result_value
    `;
    return await this.query(sql);
  }

  /**
   * Get latest inspection sessions (completed/in_progress)
   */
  static async getLatestInspectionSessions(limit = 5) {
    const sql = `
      SELECT 
        s.id as session_id,
        s.completed_at,
        s.started_at,
        s.status as session_status,
        u.name as inspector_name,
        COUNT(d.id) as total_inspected,
        SUM(CASE WHEN d.status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_sessions s
      INNER JOIN users u ON s.inspector_id = u.id
      LEFT JOIN inspection_details d ON d.session_id = s.id AND d.deleted_at IS NULL
      WHERE s.deleted_at IS NULL AND s.status != 'canceled'
      GROUP BY s.id, s.completed_at, s.started_at, s.status, u.name
      ORDER BY s.id DESC
      LIMIT ?
    `;
    return await this.query(sql, [parseInt(limit)]);
  }
}

module.exports = DashboardRepository;
