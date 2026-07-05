const BaseRepository = require('./base.repository');

class AnalyticsRepository extends BaseRepository {
  /**
   * Find physical servers with highest failure count
   */
  static async getTopServerFails(limit = 5) {
    const sql = `
      SELECT 
        ps.id as server_id,
        ps.server_name,
        COUNT(d.id) as fail_count
      FROM physical_servers ps
      INNER JOIN inspection_details d ON ps.id = d.physical_server_id AND d.status = 'fail' AND d.deleted_at IS NULL
      INNER JOIN inspection_sessions s ON d.session_id = s.id AND s.status = 'completed' AND s.deleted_at IS NULL
      WHERE ps.status = 'active' AND ps.deleted_at IS NULL
      GROUP BY ps.id, ps.server_name
      ORDER BY fail_count DESC
      LIMIT ?
    `;
    return await this.query(sql, [limit]);
  }

  /**
   * Find racks with highest failures
   */
  static async getTopRackFails(limit = 5) {
    const sql = `
      SELECT 
        r.id as rack_id,
        r.rack_name,
        rm.room_name,
        COUNT(d.id) as fail_count
      FROM racks r
      INNER JOIN rooms rm ON r.room_id = rm.id
      INNER JOIN physical_servers ps ON ps.rack_id = r.id AND ps.status = 'active' AND ps.deleted_at IS NULL
      INNER JOIN inspection_details d ON ps.id = d.physical_server_id AND d.status = 'fail' AND d.deleted_at IS NULL
      INNER JOIN inspection_sessions s ON d.session_id = s.id AND s.status = 'completed' AND s.deleted_at IS NULL
      GROUP BY r.id, r.rack_name, rm.room_name
      ORDER BY fail_count DESC
      LIMIT ?
    `;
    return await this.query(sql, [limit]);
  }

  /**
   * Find rooms with highest failure counts
   */
  static async getTopRoomFails(limit = 5) {
    const sql = `
      SELECT 
        rm.id as room_id,
        rm.room_name,
        COUNT(d.id) as fail_count
      FROM rooms rm
      INNER JOIN racks r ON r.room_id = rm.id
      INNER JOIN physical_servers ps ON ps.rack_id = r.id AND ps.status = 'active' AND ps.deleted_at IS NULL
      INNER JOIN inspection_details d ON ps.id = d.physical_server_id AND d.status = 'fail' AND d.deleted_at IS NULL
      INNER JOIN inspection_sessions s ON d.session_id = s.id AND s.status = 'completed' AND s.deleted_at IS NULL
      GROUP BY rm.id, rm.room_name
      ORDER BY fail_count DESC
      LIMIT ?
    `;
    return await this.query(sql, [limit]);
  }

  /**
   * Find users with highest completed walking checks
   */
  static async getTopInspectors(limit = 5) {
    const sql = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        COUNT(s.id) as completed_sessions
      FROM users u
      INNER JOIN inspection_sessions s ON u.id = s.inspector_id AND s.status = 'completed' AND s.deleted_at IS NULL
      GROUP BY u.id, u.name
      ORDER BY completed_sessions DESC
      LIMIT ?
    `;
    return await this.query(sql, [limit]);
  }

  /**
   * Get average walk inspection session duration in seconds
   */
  static async getAverageInspectionTime() {
    const sql = `
      SELECT 
        AVG(TIMESTAMPDIFF(SECOND, s.started_at, s.completed_at)) as avg_time_seconds
      FROM inspection_sessions s
      WHERE s.status = 'completed' AND s.completed_at IS NOT NULL AND s.deleted_at IS NULL
    `;
    const rows = await this.query(sql);
    return rows.length > 0 && rows[0].avg_time_seconds !== null ? parseFloat(rows[0].avg_time_seconds) : 0;
  }

  /**
   * Get overall stats summary: active servers count, total checks, PASS/WARN/FAIL count
   */
  static async getInspectionStatsSummary() {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM physical_servers WHERE status = 'active' AND deleted_at IS NULL) as active_servers_count,
        (SELECT COUNT(*) FROM inspection_sessions WHERE status = 'completed' AND deleted_at IS NULL) as total_sessions_count,
        COUNT(d.id) as total_inspections,
        SUM(CASE WHEN d.status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warn_count,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_details d
      INNER JOIN inspection_sessions s ON d.session_id = s.id AND s.status = 'completed' AND s.deleted_at IS NULL
      WHERE d.deleted_at IS NULL
    `;
    const rows = await this.query(sql);
    if (rows.length > 0) {
      return {
        active_servers_count: Number(rows[0].active_servers_count),
        total_sessions_count: Number(rows[0].total_sessions_count),
        total_inspections: Number(rows[0].total_inspections),
        pass_count: Number(rows[0].pass_count || 0),
        warn_count: Number(rows[0].warn_count || 0),
        fail_count: Number(rows[0].fail_count || 0)
      };
    }
    return { active_servers_count: 0, total_sessions_count: 0, total_inspections: 0, pass_count: 0, warn_count: 0, fail_count: 0 };
  }

  /**
   * Get monthly inspection rates (PASS vs FAIL) for the current year
   */
  static async getMonthlyInspectionRates() {
    const sql = `
      SELECT 
        MONTH(d.created_at) as inspect_month,
        COUNT(d.id) as total_inspected,
        SUM(CASE WHEN d.status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_details d
      INNER JOIN inspection_sessions s ON d.session_id = s.id AND s.status = 'completed' AND s.deleted_at IS NULL
      WHERE YEAR(d.created_at) = YEAR(CURRENT_DATE) AND d.deleted_at IS NULL
      GROUP BY MONTH(d.created_at)
      ORDER BY inspect_month
    `;
    return await this.query(sql);
  }
  /**
   * Get VM overall stats summary: total checks, PASS/WARN/FAIL count
   */
  static async getVmInspectionStatsSummary() {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM virtual_machines WHERE status = 'running' AND deleted_at IS NULL) as active_vms_count,
        (SELECT COUNT(*) FROM vm_inspection_sessions WHERE status = 'completed' AND deleted_at IS NULL) as total_sessions_count,
        COUNT(d.id) as total_inspections,
        SUM(CASE WHEN d.status = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warn_count,
        SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM vm_inspection_details d
      INNER JOIN vm_inspection_sessions s ON d.session_id = s.id AND s.status = 'completed' AND s.deleted_at IS NULL
      WHERE d.deleted_at IS NULL
    `;
    const rows = await this.query(sql);
    if (rows.length > 0) {
      return {
        active_vms_count: Number(rows[0].active_vms_count),
        total_sessions_count: Number(rows[0].total_sessions_count),
        total_inspections: Number(rows[0].total_inspections),
        pass_count: Number(rows[0].pass_count || 0),
        warn_count: Number(rows[0].warn_count || 0),
        fail_count: Number(rows[0].fail_count || 0)
      };
    }
    return { active_vms_count: 0, total_sessions_count: 0, total_inspections: 0, pass_count: 0, warn_count: 0, fail_count: 0 };
  }
}

module.exports = AnalyticsRepository;
