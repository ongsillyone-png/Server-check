const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT u.*, r.role_name 
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.username LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR r.role_name LIKE ?
      ORDER BY u.id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, searchVal, searchVal, searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total 
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.username LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR r.role_name LIKE ?
    `;
    const res = await this.query(sql, [searchVal, searchVal, searchVal, searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `
      SELECT u.*, r.role_name 
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const sql = `
      SELECT u.*, r.role_name 
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.username = ? AND u.is_active = 1
    `;
    const rows = await this.query(sql, [username]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO users (username, password_hash, role_id, name, email, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const res = await this.query(sql, [
      data.username,
      data.password_hash,
      data.role_id,
      data.name,
      data.email,
      data.is_active !== undefined ? data.is_active : 1
    ]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    let sql;
    let params;
    
    if (data.password_hash) {
      sql = `
        UPDATE users 
        SET username = ?, password_hash = ?, role_id = ?, name = ?, email = ?, is_active = ? 
        WHERE id = ?
      `;
      params = [data.username, data.password_hash, data.role_id, data.name, data.email, data.is_active, id];
    } else {
      sql = `
        UPDATE users 
        SET username = ?, role_id = ?, name = ?, email = ?, is_active = ? 
        WHERE id = ?
      `;
      params = [data.username, data.role_id, data.name, data.email, data.is_active, id];
    }
    
    await this.query(sql, params);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM users WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = UserRepository;
