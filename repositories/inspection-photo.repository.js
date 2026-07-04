const BaseRepository = require('./base.repository');

class InspectionPhotoRepository {
  /**
   * Create an inspection photo record
   */
  static async createPhoto(detailId, resultId, photoPath, createdBy, connection = null) {
    const sql = `
      INSERT INTO inspection_photos (detail_id, result_id, photo_path, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [detailId, resultId, photoPath, createdBy, createdBy];
    const result = await BaseRepository.query(sql, params, connection);
    return Number(result.insertId);
  }

  /**
   * Delete photo records by inspection detail ID
   * This prevents orphan records when updating/re-submitting checks
   */
  static async deletePhotosByDetail(detailId, connection = null) {
    const sql = 'DELETE FROM inspection_photos WHERE detail_id = ?';
    await BaseRepository.query(sql, [detailId], connection);
  }

  /**
   * Get photos by inspection detail ID
   */
  static async findPhotosByDetail(detailId) {
    const sql = 'SELECT * FROM inspection_photos WHERE detail_id = ? AND deleted_at IS NULL';
    return await BaseRepository.query(sql, [detailId]);
  }
}

module.exports = InspectionPhotoRepository;
