const BaseRepository = require('./base.repository');

class VmInspectionSessionRepository {
  /**
   * Find active in_progress VM session for an inspector
   */
static async findActiveSession() {
    const sql = `
        SELECT s.*, u.name AS inspector_name
        FROM vm_inspection_sessions s
        JOIN users u ON s.inspector_id = u.id
        WHERE s.status='in_progress'
        AND s.deleted_at IS NULL
        LIMIT 1
    `;

    const rows = await BaseRepository.query(sql);
    return rows.length ? rows[0] : null;
}

  /**
   * Find a VM session by ID
   */
  static async findById(id) {
    const sql = `
      SELECT s.*, u.name as inspector_name
      FROM vm_inspection_sessions s
      JOIN users u ON s.inspector_id = u.id
      WHERE s.id = ? AND s.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await BaseRepository.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create a new VM walkthrough session
   */
  static async createSession(inspectorId, createdBy, connection = null) {
    const sql = `
      INSERT INTO vm_inspection_sessions (inspector_id, status, created_by, updated_by)
      VALUES (?, 'in_progress', ?, ?)
    `;
    const result = await BaseRepository.query(sql, [inspectorId, createdBy, createdBy], connection);
    return Number(result.insertId);
  }

  /**
   * Mark session as completed
   */
  static async completeSession(id, updatedBy, connection = null) {
    const sql = `
      UPDATE vm_inspection_sessions 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_by = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;
    await BaseRepository.query(sql, [updatedBy, id], connection);
  }

  /**
   * Mark session as canceled
   */
  static async cancelSession(id, updatedBy, connection = null) {
    const sql = `
      UPDATE vm_inspection_sessions 
      SET status = 'canceled', completed_at = CURRENT_TIMESTAMP, updated_by = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;
    await BaseRepository.query(sql, [updatedBy, id], connection);
  }

  /**
   * Reopen a completed session
   */
  static async reopenSession(id, updatedBy, connection = null) {
    const sql = `
      UPDATE vm_inspection_sessions 
      SET status = 'in_progress', completed_at = NULL, updated_by = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;
    await BaseRepository.query(sql, [updatedBy, id], connection);
  }

  /**
   * Count sessions today for an inspector (excluding canceled)
   */
  static async countSessionsTodayByInspector(inspectorId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM vm_inspection_sessions 
      WHERE inspector_id = ? 
        AND DATE(started_at) = CURDATE() 
        AND status != 'canceled' 
        AND deleted_at IS NULL
    `;
    const rows = await BaseRepository.query(sql, [inspectorId]);
    return Number(rows[0].count);
  }

  /**
   * Find all VM sessions today (excluding canceled)
   */
  static async findSessionsToday() {
    const sql = `
      SELECT s.*, u.name as inspector_name
      FROM vm_inspection_sessions s
      JOIN users u ON s.inspector_id = u.id
      WHERE DATE(s.started_at) = CURDATE() 
        AND s.status != 'canceled' 
        AND s.deleted_at IS NULL
      ORDER BY s.id ASC
    `;
    return await BaseRepository.query(sql);
  }
  /**
   * Find VM sessions matching filters with pagination
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
      FROM vm_inspection_sessions s
      JOIN users u ON s.inspector_id = u.id
      LEFT JOIN vm_inspection_details d ON d.session_id = s.id AND d.deleted_at IS NULL
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
        FROM vm_inspection_details d2
        JOIN virtual_machines vm ON d2.vm_id = vm.id
        JOIN physical_servers ps ON vm.physical_server_id = ps.id
        JOIN racks rk ON ps.rack_id = rk.id
        WHERE rk.room_id = ? AND d2.deleted_at IS NULL AND vm.deleted_at IS NULL AND ps.deleted_at IS NULL AND rk.deleted_at IS NULL
      )`;
      params.push(Number(roomId));
    }
    if (rackId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM vm_inspection_details d2
        JOIN virtual_machines vm ON d2.vm_id = vm.id
        JOIN physical_servers ps ON vm.physical_server_id = ps.id
        WHERE ps.rack_id = ? AND d2.deleted_at IS NULL AND vm.deleted_at IS NULL AND ps.deleted_at IS NULL
      )`;
      params.push(Number(rackId));
    }
    if (serverId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM vm_inspection_details d2
        JOIN virtual_machines vm ON d2.vm_id = vm.id
        WHERE vm.physical_server_id = ? AND d2.deleted_at IS NULL AND vm.deleted_at IS NULL
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
   * Count total VM sessions matching filters
   */
  static async countSessionsWithFilters({ startDate, endDate, roomId, rackId, serverId, inspectorId }) {
    let sql = `
      SELECT COUNT(DISTINCT s.id) as count
      FROM vm_inspection_sessions s
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
        FROM vm_inspection_details d2
        JOIN virtual_machines vm ON d2.vm_id = vm.id
        JOIN physical_servers ps ON vm.physical_server_id = ps.id
        JOIN racks rk ON ps.rack_id = rk.id
        WHERE rk.room_id = ? AND d2.deleted_at IS NULL AND vm.deleted_at IS NULL AND ps.deleted_at IS NULL AND rk.deleted_at IS NULL
      )`;
      params.push(Number(roomId));
    }
    if (rackId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM vm_inspection_details d2
        JOIN virtual_machines vm ON d2.vm_id = vm.id
        JOIN physical_servers ps ON vm.physical_server_id = ps.id
        WHERE ps.rack_id = ? AND d2.deleted_at IS NULL AND vm.deleted_at IS NULL AND ps.deleted_at IS NULL
      )`;
      params.push(Number(rackId));
    }
    if (serverId) {
      sql += ` AND s.id IN (
        SELECT DISTINCT d2.session_id 
        FROM vm_inspection_details d2
        JOIN virtual_machines vm ON d2.vm_id = vm.id
        WHERE vm.physical_server_id = ? AND d2.deleted_at IS NULL AND vm.deleted_at IS NULL
      )`;
      params.push(Number(serverId));
    }

    const rows = await BaseRepository.query(sql, params);
    return Number(rows[0].count);
  }
}

module.exports = VmInspectionSessionRepository;
