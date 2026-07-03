const BaseRepository = require('./base.repository');

class RackRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT r.*, rm.room_name 
      FROM racks r
      INNER JOIN rooms rm ON r.room_id = rm.id
      WHERE r.rack_name LIKE ? OR rm.room_name LIKE ?
      ORDER BY r.id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total 
      FROM racks r
      INNER JOIN rooms rm ON r.room_id = rm.id
      WHERE r.rack_name LIKE ? OR rm.room_name LIKE ?
    `;
    const res = await this.query(sql, [searchVal, searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `
      SELECT r.*, rm.room_name 
      FROM racks r
      INNER JOIN rooms rm ON r.room_id = rm.id
      WHERE r.id = ?
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO racks (room_id, rack_name, unit_size, description) 
      VALUES (?, ?, ?, ?)
    `;
    const res = await this.query(sql, [data.room_id, data.rack_name, data.unit_size, data.description || null]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE racks 
      SET room_id = ?, rack_name = ?, unit_size = ?, description = ? 
      WHERE id = ?
    `;
    await this.query(sql, [data.room_id, data.rack_name, data.unit_size, data.description || null, id]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM racks WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = RackRepository;
