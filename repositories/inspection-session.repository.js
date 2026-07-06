const BaseRepository = require('./base.repository');

class InspectionSessionRepository {
  /**
   * Find active in_progress session for an inspector
   * @param {number} inspectorId 
   * @returns {Promise<Object|null>}
   */
  static async findActiveSession() {
  const sql = `
    SELECT s.*, u.name AS inspector_name
    FROM inspection_sessions s
    JOIN users u ON s.inspector_id = u.id
    WHERE s.status = 'in_progress'
      AND s.deleted_at IS NULL
    ORDER BY s.started_at DESC
    LIMIT 1
  `;

  const rows = await BaseRepository.query(sql);
  return rows.length > 0 ? rows[0] : null;
}

  /**
   * Find a session by ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = 'SELECT * FROM inspection_sessions WHERE id = ? AND deleted_at IS NULL';
    const rows = await BaseRepository.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create a new walkthrough session
   * @param {number} inspectorId 
   * @param {number} createdBy 
   * @param {Object} [connection] Optional transaction connection
   * @returns {Promise<number>} newly created session ID
   */
  static async createSession(inspectorId, createdBy, connection = null) {
    const sql = `
      INSERT INTO inspection_sessions (inspector_id, status, created_by, updated_by)
      VALUES (?, 'in_progress', ?, ?)
    `;
    const params = [inspectorId, createdBy, createdBy];
    const result = await BaseRepository.query(sql, params, connection);
    return Number(result.insertId);
  }

  /**
   * Mark session as completed
   * @param {number} id 
   * @param {number} updatedBy 
   * @param {Object} [connection] Optional transaction connection
   */
  static async completeSession(id, updatedBy, connection = null) {
    const sql = `
      UPDATE inspection_sessions 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_by = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;
    await BaseRepository.query(sql, [updatedBy, id], connection);
  }

  /**
   * Mark session as canceled
   * @param {number} id 
   * @param {number} updatedBy 
   * @param {Object} [connection] Optional transaction connection
   */
  static async cancelSession(id, updatedBy, connection = null) {
    const sql = `
      UPDATE inspection_sessions 
      SET status = 'canceled', completed_at = CURRENT_TIMESTAMP, updated_by = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;
    await BaseRepository.query(sql, [updatedBy, id], connection);
  }

  /**
   * Count completed inspection sessions today
   * @returns {Promise<number>}
   */
  static async countCompletedSessionsToday() {
    const sql = `
      SELECT COUNT(*) as count 
      FROM inspection_sessions 
      WHERE status = 'completed' 
        AND DATE(completed_at) = CURDATE() 
        AND deleted_at IS NULL
    `;
    const rows = await BaseRepository.query(sql);
    return Number(rows[0].count);
  }

  /**
   * Find the latest session today for an inspector (excluding canceled)
   * @param {number} inspectorId
   * @returns {Promise<Object|null>}
   */
  static async findLatestSessionTodayByInspector(inspectorId) {
    const sql = `
      SELECT * FROM inspection_sessions 
      WHERE inspector_id = ? 
        AND DATE(started_at) = CURDATE() 
        AND status != 'canceled' 
        AND deleted_at IS NULL
      ORDER BY id DESC LIMIT 1
    `;
    const rows = await BaseRepository.query(sql, [inspectorId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Count sessions today for an inspector (excluding canceled)
   * @param {number} inspectorId
   * @returns {Promise<number>}
   */
  static async countSessionsTodayByInspector(inspectorId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM inspection_sessions 
      WHERE inspector_id = ? 
        AND DATE(started_at) = CURDATE() 
        AND status != 'canceled' 
        AND deleted_at IS NULL
    `;
    const rows = await BaseRepository.query(sql, [inspectorId]);
    return Number(rows[0].count);
  }

  /**
   * Reopen a completed session (set status back to in_progress)
   * @param {number} id
   * @param {number} updatedBy
   * @param {Object} [connection] Optional transaction connection
   */
  static async reopenSession(id, updatedBy, connection = null) {
    const sql = `
      UPDATE inspection_sessions 
      SET status = 'in_progress', completed_at = NULL, updated_by = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;
    await BaseRepository.query(sql, [updatedBy, id], connection);
  }

  /**
   * Find all sessions today (excluding canceled) with inspector name
   * @returns {Promise<Array>}
   */
  static async findSessionsToday() {
    const sql = `
      SELECT s.*, u.name as inspector_name
      FROM inspection_sessions s
      JOIN users u ON s.inspector_id = u.id
      WHERE DATE(s.started_at) = CURDATE() 
        AND s.status != 'canceled' 
        AND s.deleted_at IS NULL
      ORDER BY s.id ASC
    `;
    return await BaseRepository.query(sql);
  }

  /**
   * Find inspection sessions matching filters with pagination
   */
  static async findSessionsWithFilters({ startDate, endDate, roomId, rackId, serverId, inspectorId, limit, offset }) {
    let sql = `
      SELECT s.id as session_id,
             s.started_at,
             s.completed_at,
             s.status as session_status,
             u.name as inspector_name,
             COUNT(d.id) as total_inspected,
             SUM(CASE WHEN d.status = 'pass' THEN 1 ELSE 0 END) as pass_count,
             SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
             SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_sessions s
      JOIN users u ON s.inspector_id = u.id
      LEFT JOIN inspection_details d ON d.session_id = s.id AND d.deleted_at IS NULL
      WHERE s.deleted_at IS NULL AND s.status != 'canceled'
    `;
    const params = [];

    if (startDate) {
      sql += ' AND s.started_at >= ?';
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      sql += ' AND s.started_at <= ?';
      params.push(`${endDate} 23:59:59`);
    }
    if (inspectorId) {
      sql += ' AND s.inspector_id = ?';
      params.push(Number(inspectorId));
    }
    if (roomId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM inspection_details d2
        JOIN physical_servers ps ON d2.physical_server_id = ps.id
        JOIN racks rk ON ps.rack_id = rk.id
        WHERE rk.room_id = ? AND d2.deleted_at IS NULL AND ps.deleted_at IS NULL AND rk.deleted_at IS NULL
      )`;
      params.push(Number(roomId));
    }
    if (rackId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM inspection_details d2
        JOIN physical_servers ps ON d2.physical_server_id = ps.id
        WHERE ps.rack_id = ? AND d2.deleted_at IS NULL AND ps.deleted_at IS NULL
      )`;
      params.push(Number(rackId));
    }
    if (serverId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM inspection_details d2
        WHERE d2.physical_server_id = ? AND d2.deleted_at IS NULL
      )`;
      params.push(Number(serverId));
    }

    sql += ' GROUP BY s.id, s.started_at, s.completed_at, s.status, u.name';
    sql += ' ORDER BY s.id DESC';

    if (limit !== undefined && offset !== undefined) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));
    }

    return await BaseRepository.query(sql, params);
  }

  /**
   * Count total inspection sessions matching filters
   */
  static async countSessionsWithFilters({ startDate, endDate, roomId, rackId, serverId, inspectorId }) {
    let sql = `
      SELECT COUNT(DISTINCT s.id) as count
      FROM inspection_sessions s
      WHERE s.deleted_at IS NULL AND s.status != 'canceled'
    `;
    const params = [];

    if (startDate) {
      sql += ' AND s.started_at >= ?';
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      sql += ' AND s.started_at <= ?';
      params.push(`${endDate} 23:59:59`);
    }
    if (inspectorId) {
      sql += ' AND s.inspector_id = ?';
      params.push(Number(inspectorId));
    }
    if (roomId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM inspection_details d2
        JOIN physical_servers ps ON d2.physical_server_id = ps.id
        JOIN racks rk ON ps.rack_id = rk.id
        WHERE rk.room_id = ? AND d2.deleted_at IS NULL AND ps.deleted_at IS NULL AND rk.deleted_at IS NULL
      )`;
      params.push(Number(roomId));
    }
    if (rackId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM inspection_details d2
        JOIN physical_servers ps ON d2.physical_server_id = ps.id
        WHERE ps.rack_id = ? AND d2.deleted_at IS NULL AND ps.deleted_at IS NULL
      )`;
      params.push(Number(rackId));
    }
    if (serverId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM inspection_details d2
        WHERE d2.physical_server_id = ? AND d2.deleted_at IS NULL
      )`;
      params.push(Number(serverId));
    }

    const rows = await BaseRepository.query(sql, params);
    return Number(rows[0].count);
  }

  /**
   * Get detail summary for report view
   */
  static async getSessionDetailsForReport(sessionId) {
    const sql = `
      SELECT s.id as session_id,
             s.started_at,
             s.completed_at,
             s.status as session_status,
             u.name as inspector_name,
             u.id as inspector_id,
             r.role_name as inspector_role,
             COUNT(d.id) as total_inspected,
             SUM(CASE WHEN d.status = 'pass' THEN 1 ELSE 0 END) as pass_count,
             SUM(CASE WHEN d.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
             SUM(CASE WHEN d.status = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM inspection_sessions s
      JOIN users u ON s.inspector_id = u.id
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN inspection_details d ON d.session_id = s.id AND d.deleted_at IS NULL
      WHERE s.id = ? AND s.deleted_at IS NULL
      GROUP BY s.id, s.started_at, s.completed_at, s.status, u.name, u.id, r.role_name
      LIMIT 1
    `;
    const rows = await BaseRepository.query(sql, [sessionId]);
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = InspectionSessionRepository;
