const BaseRepository = require('./base.repository');

class RoleRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT * FROM roles 
      WHERE role_name LIKE ? OR role_code LIKE ?
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total FROM roles 
      WHERE role_name LIKE ? OR role_code LIKE ?
    `;
    const res = await this.query(sql, [searchVal, searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `SELECT * FROM roles WHERE id = ?`;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO roles (role_name, role_code, description) 
      VALUES (?, ?, ?)
    `;
    const res = await this.query(sql, [data.role_name, data.role_code.toUpperCase(), data.description || null]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE roles 
      SET role_name = ?, role_code = ?, description = ? 
      WHERE id = ?
    `;
    await this.query(sql, [data.role_name, data.role_code.toUpperCase(), data.description || null, id]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM roles WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = RoleRepository;
