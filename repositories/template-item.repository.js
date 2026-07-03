const BaseRepository = require('./base.repository');

class TemplateItemRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT iti.*, t.template_name 
      FROM inspection_template_items iti
      INNER JOIN inspection_templates t ON iti.template_id = t.id
      WHERE iti.item_name LIKE ? OR t.template_name LIKE ?
      ORDER BY iti.id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total 
      FROM inspection_template_items iti
      INNER JOIN inspection_templates t ON iti.template_id = t.id
      WHERE iti.item_name LIKE ? OR t.template_name LIKE ?
    `;
    const res = await this.query(sql, [searchVal, searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `
      SELECT iti.*, t.template_name 
      FROM inspection_template_items iti
      INNER JOIN inspection_templates t ON iti.template_id = t.id
      WHERE iti.id = ?
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO inspection_template_items (template_id, item_name, description, item_type, sort_order, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const res = await this.query(sql, [
      data.template_id,
      data.item_name,
      data.description || null,
      data.item_type || 'boolean',
      data.sort_order || 0,
      data.is_active !== undefined ? data.is_active : 1
    ]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE inspection_template_items 
      SET template_id = ?, item_name = ?, description = ?, item_type = ?, sort_order = ?, is_active = ? 
      WHERE id = ?
    `;
    await this.query(sql, [
      data.template_id,
      data.item_name,
      data.description || null,
      data.item_type || 'boolean',
      data.sort_order || 0,
      data.is_active !== undefined ? data.is_active : 1,
      id
    ]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM inspection_template_items WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = TemplateItemRepository;
