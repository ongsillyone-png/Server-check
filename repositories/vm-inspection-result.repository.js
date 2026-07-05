const BaseRepository = require('./base.repository');

class VmInspectionResultRepository {
  /**
   * Create an individual VM checklist item result
   */
  static async createResult(detailId, templateItemId, resultValue, booleanValue, numericValue, textValue, remark, createdBy, connection = null) {
    const sql = `
      INSERT INTO vm_inspection_results (
        detail_id, template_item_id, result_value, 
        boolean_value, numeric_value, text_value, 
        remark, created_by, updated_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      detailId, templateItemId, resultValue,
      booleanValue !== undefined ? booleanValue : null,
      numericValue !== undefined ? numericValue : null,
      textValue !== undefined ? textValue : null,
      remark, createdBy, createdBy
    ];
    const result = await BaseRepository.query(sql, params, connection);
    return Number(result.insertId);
  }

  /**
   * Delete previous results for a VM inspection detail (used when re-submitting)
   */
  static async deleteResultsByDetail(detailId, connection = null) {
    const sql = 'DELETE FROM vm_inspection_results WHERE detail_id = ?';
    await BaseRepository.query(sql, [detailId], connection);
  }

  /**
   * Find results for a VM inspection detail
   */
  static async findResultsByDetail(detailId) {
    const sql = `
      SELECT r.*, ti.item_name, ti.item_type
      FROM vm_inspection_results r
      JOIN inspection_template_items ti ON r.template_item_id = ti.id
      WHERE r.detail_id = ? AND r.deleted_at IS NULL
      ORDER BY ti.sort_order ASC, ti.id ASC
    `;
    return await BaseRepository.query(sql, [detailId]);
  }

  /**
   * Find results with template item details for report view
   */
  static async findResultsWithItemsByDetail(detailId) {
    const sql = `
      SELECT r.*, 
             ti.item_name, 
             ti.item_type,
             ti.description as item_description
      FROM vm_inspection_results r
      JOIN inspection_template_items ti ON r.template_item_id = ti.id
      WHERE r.detail_id = ? AND r.deleted_at IS NULL
      ORDER BY ti.sort_order ASC, ti.id ASC
    `;
    return await BaseRepository.query(sql, [detailId]);
  }
}

module.exports = VmInspectionResultRepository;
