const BaseRepository = require('./base.repository');

class RoomRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT * FROM rooms 
      WHERE room_name LIKE ? OR building LIKE ? OR floor LIKE ?
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, searchVal, searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total FROM rooms 
      WHERE room_name LIKE ? OR building LIKE ? OR floor LIKE ?
    `;
    const res = await this.query(sql, [searchVal, searchVal, searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `SELECT * FROM rooms WHERE id = ?`;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO rooms (room_name, floor, building, description) 
      VALUES (?, ?, ?, ?)
    `;
    const res = await this.query(sql, [data.room_name, data.floor, data.building, data.description || null]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE rooms 
      SET room_name = ?, floor = ?, building = ?, description = ? 
      WHERE id = ?
    `;
    await this.query(sql, [data.room_name, data.floor, data.building, data.description || null, id]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM rooms WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = RoomRepository;
