const BaseRepository = require('./base.repository');

class TemplateRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT * FROM inspection_templates 
      WHERE template_name LIKE ?
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total FROM inspection_templates 
      WHERE template_name LIKE ?
    `;
    const res = await this.query(sql, [searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `SELECT * FROM inspection_templates WHERE id = ?`;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO inspection_templates (template_name, is_active) 
      VALUES (?, ?)
    `;
    const res = await this.query(sql, [data.template_name, data.is_active !== undefined ? data.is_active : 1]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE inspection_templates 
      SET template_name = ?, is_active = ? 
      WHERE id = ?
    `;
    await this.query(sql, [data.template_name, data.is_active !== undefined ? data.is_active : 1, id]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM inspection_templates WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = TemplateRepository;
