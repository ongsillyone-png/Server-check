const BaseRepository = require('./base.repository');

class InspectionResultRepository {
  /**
   * Create an individual checklist item result
   */
  static async createResult(
    detailId,
    templateItemId,
    resultValue,
    booleanValue,
    numericValue,
    textValue,
    remark,
    createdBy,
    connection = null
  ) {
    const sql = `
      INSERT INTO inspection_results (
        detail_id, template_item_id, result_value, 
        boolean_value, numeric_value, text_value, 
        remark, created_by, updated_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      detailId,
      templateItemId,
      resultValue,
      booleanValue !== undefined ? booleanValue : null,
      numericValue !== undefined ? numericValue : null,
      textValue !== undefined ? textValue : null,
      remark,
      createdBy,
      createdBy
    ];
    const result = await BaseRepository.query(sql, params, connection);
    return Number(result.insertId);
  }

  /**
   * Delete previous checklist results for a server inspection entry
   * Used when re-submitting checks to prevent duplicates
   */
  static async deleteResultsByDetail(detailId, connection = null) {
    const sql = 'DELETE FROM inspection_results WHERE detail_id = ?';
    await BaseRepository.query(sql, [detailId], connection);
  }

  /**
   * Find checklist answers recorded for an inspection detail ID
   * @param {number} detailId 
   * @returns {Promise<Array>}
   */
  static async findResultsByDetail(detailId) {
    const sql = `
      SELECT r.*, ti.item_name, ti.item_type
      FROM inspection_results r
      JOIN inspection_template_items ti ON r.template_item_id = ti.id
      WHERE r.detail_id = ? AND r.deleted_at IS NULL
    `;
    return await BaseRepository.query(sql, [detailId]);
  }

  /**
   * Find results with checklist details and any uploaded photos
   */
  static async findResultsWithPhotosByDetail(detailId) {
    const sql = `
      SELECT r.*, 
             ti.item_name, 
             ti.item_type,
             p.photo_path
      FROM inspection_results r
      JOIN inspection_template_items ti ON r.template_item_id = ti.id
      LEFT JOIN inspection_photos p ON p.result_id = r.id AND p.deleted_at IS NULL
      WHERE r.detail_id = ? AND r.deleted_at IS NULL
      ORDER BY ti.sort_order ASC, ti.id ASC
    `;
    return await BaseRepository.query(sql, [detailId]);
  }
}

module.exports = InspectionResultRepository;
