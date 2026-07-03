const BaseRepository = require('./base.repository');

class AssetTypeRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT * FROM asset_types 
      WHERE type_name LIKE ?
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total FROM asset_types 
      WHERE type_name LIKE ?
    `;
    const res = await this.query(sql, [searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `SELECT * FROM asset_types WHERE id = ?`;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO asset_types (type_name, description) 
      VALUES (?, ?)
    `;
    const res = await this.query(sql, [data.type_name, data.description || null]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE asset_types 
      SET type_name = ?, description = ? 
      WHERE id = ?
    `;
    await this.query(sql, [data.type_name, data.description || null, id]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM asset_types WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = AssetTypeRepository;
