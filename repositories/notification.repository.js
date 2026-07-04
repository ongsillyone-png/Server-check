const BaseRepository = require('./base.repository');

class NotificationRepository extends BaseRepository {
  /**
   * Insert new notification record
   */
  static async create(data) {
    const sql = `
      INSERT INTO notifications (title, message, type, is_read, created_by, updated_by)
      VALUES (?, ?, ?, 0, ?, ?)
    `;
    const res = await this.query(sql, [
      data.title,
      data.message,
      data.type || 'daily_summary',
      data.created_by || null,
      data.updated_by || null
    ]);
    return Number(res.insertId);
  }

  /**
   * Fetch paginated active notifications list (non-deleted)
   */
  static async findAll(limit = 10, offset = 0) {
    const sql = `
      SELECT * FROM notifications
      WHERE deleted_at IS NULL
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
    return await this.query(sql, [parseInt(limit), parseInt(offset)]);
  }

  /**
   * Count total active notifications
   */
  static async countAll() {
    const sql = `
      SELECT COUNT(*) as total FROM notifications
      WHERE deleted_at IS NULL
    `;
    const res = await this.query(sql);
    return Number(res[0].total);
  }

  /**
   * Count unread notifications
   */
  static async countUnread() {
    const sql = `
      SELECT COUNT(*) as total FROM notifications
      WHERE deleted_at IS NULL AND is_read = 0
    `;
    const res = await this.query(sql);
    return Number(res[0].total);
  }

  /**
   * Mark a specific notification as read
   */
  static async markAsRead(id) {
    const sql = `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND deleted_at IS NULL
    `;
    await this.query(sql, [id]);
    return true;
  }

  /**
   * Mark all unread notifications as read
   */
  static async markAllAsRead() {
    const sql = `
      UPDATE notifications
      SET is_read = 1
      WHERE is_read = 0 AND deleted_at IS NULL
    `;
    await this.query(sql);
    return true;
  }

  /**
   * Soft delete a notification record
   */
  static async delete(id) {
    const sql = `
      UPDATE notifications
      SET deleted_at = NOW()
      WHERE id = ?
    `;
    await this.query(sql, [id]);
    return true;
  }

  /**
   * Query database statistics for today's daily walk checks summary
   */
  static async getDailySummaryStats() {
    // 1. Total completed rounds today
    const sessionsSql = `
      SELECT COUNT(*) as total 
      FROM inspection_sessions 
      WHERE DATE(completed_at) = CURDATE() AND status = 'completed'
    `;
    const sessionsRes = await this.query(sessionsSql);
    const completedRounds = Number(sessionsRes[0].total);

    // 2. Inspected counts grouped by status
    const countsSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN overall_status = 'pass' THEN 1 ELSE 0 END), 0) as pass_count,
        COALESCE(SUM(CASE WHEN overall_status = 'warning' THEN 1 ELSE 0 END), 0) as warn_count,
        COALESCE(SUM(CASE WHEN overall_status = 'fail' THEN 1 ELSE 0 END), 0) as fail_count
      FROM inspection_details
      WHERE DATE(inspected_at) = CURDATE()
    `;
    const countsRes = await this.query(countsSql);
    const passCount = Number(countsRes[0].pass_count);
    const warnCount = Number(countsRes[0].warn_count);
    const failCount = Number(countsRes[0].fail_count);
    const totalInspected = passCount + warnCount + failCount;

    // 3. Active servers currently remaining uninspected today
    const totalActiveSql = `SELECT COUNT(*) as total FROM physical_servers WHERE status = 'active'`;
    const totalActiveRes = await this.query(totalActiveSql);
    const totalActive = Number(totalActiveRes[0].total);

    const distinctInspectedSql = `
      SELECT COUNT(DISTINCT server_id) as total 
      FROM inspection_details 
      WHERE DATE(inspected_at) = CURDATE()
    `;
    const distinctInspectedRes = await this.query(distinctInspectedSql);
    const distinctInspected = Number(distinctInspectedRes[0].total);

    const remainingUninspected = Math.max(0, totalActive - distinctInspected);

    // 4. Query detailed list of uninspected active servers today
    const uninspectedSql = `
      SELECT ps.server_name, r.rack_name, rm.room_name
      FROM physical_servers ps
      INNER JOIN racks r ON ps.rack_id = r.id
      INNER JOIN rooms rm ON r.room_id = rm.id
      WHERE ps.status = 'active'
        AND ps.id NOT IN (
          SELECT DISTINCT server_id 
          FROM inspection_details 
          WHERE DATE(inspected_at) = CURDATE()
        )
      ORDER BY rm.room_name, r.rack_name, ps.server_name
    `;
    const uninspectedServers = await this.query(uninspectedSql);

    return {
      completedRounds,
      totalInspected,
      passCount,
      warnCount,
      failCount,
      remainingUninspected,
      uninspectedServers
    };
  }
}

module.exports = NotificationRepository;
