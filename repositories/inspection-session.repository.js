const BaseRepository = require('./base.repository');

class InspectionSessionRepository {
  /**
   * Find active in_progress session for an inspector
   * @param {number} inspectorId 
   * @returns {Promise<Object|null>}
   */
  static async findActiveSessionByInspector(inspectorId) {
    const sql = `
      SELECT s.*, u.name as inspector_name
      FROM inspection_sessions s
      JOIN users u ON s.inspector_id = u.id
      WHERE s.inspector_id = ? AND s.status = 'in_progress' AND s.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await BaseRepository.query(sql, [inspectorId]);
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
}

module.exports = InspectionSessionRepository;
