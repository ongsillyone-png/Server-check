const BaseRepository = require('./base.repository');

class SettingRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT * FROM settings 
      WHERE setting_key LIKE ? OR description LIKE ?
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total FROM settings 
      WHERE setting_key LIKE ? OR description LIKE ?
    `;
    const res = await this.query(sql, [searchVal, searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `SELECT * FROM settings WHERE id = ?`;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async findByKey(key) {
    const sql = `SELECT * FROM settings WHERE setting_key = ?`;
    const rows = await this.query(sql, [key]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO settings (setting_key, setting_value, description) 
      VALUES (?, ?, ?)
    `;
    const res = await this.query(sql, [data.setting_key, data.setting_value, data.description || null]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE settings 
      SET setting_key = ?, setting_value = ?, description = ? 
      WHERE id = ?
    `;
    await this.query(sql, [data.setting_key, data.setting_value, data.description || null, id]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM settings WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = SettingRepository;
