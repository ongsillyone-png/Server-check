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
}

module.exports = InspectionSessionRepository;
