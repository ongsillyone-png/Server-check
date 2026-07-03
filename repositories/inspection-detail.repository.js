const BaseRepository = require('./base.repository');

class InspectionDetailRepository {
  /**
   * Find inspection detail for a server within a session
   * @param {number} sessionId 
   * @param {number} serverId 
   * @returns {Promise<Object|null>}
   */
  static async findBySessionAndServer(sessionId, serverId) {
    const sql = `
      SELECT * FROM inspection_details 
      WHERE session_id = ? AND physical_server_id = ? AND deleted_at IS NULL 
      LIMIT 1
    `;
    const rows = await BaseRepository.query(sql, [sessionId, serverId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create an inspection detail entry (server inspect)
   */
  static async createDetail(sessionId, serverId, status, remark, createdBy, connection = null) {
    const sql = `
      INSERT INTO inspection_details (session_id, physical_server_id, status, remark, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [sessionId, serverId, status, remark, createdBy, createdBy];
    const result = await BaseRepository.query(sql, params, connection);
    return Number(result.insertId);
  }

  /**
   * Update existing detail entry
   */
  static async updateDetail(id, status, remark, updatedBy, connection = null) {
    const sql = `
      UPDATE inspection_details 
      SET status = ?, remark = ?, updated_by = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;
    await BaseRepository.query(sql, [status, remark, updatedBy, id], connection);
  }

  /**
   * Get list of physical servers that have already been inspected in the active session
   * @param {number} sessionId 
   * @returns {Promise<Array>} list of inspected server IDs and status details
   */
  static async findInspectedServersBySession(sessionId) {
    const sql = `
      SELECT physical_server_id, status, remark 
      FROM inspection_details 
      WHERE session_id = ? AND deleted_at IS NULL
    `;
    return await BaseRepository.query(sql, [sessionId]);
  }
}

module.exports = InspectionDetailRepository;
