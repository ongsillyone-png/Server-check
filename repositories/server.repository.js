const BaseRepository = require('./base.repository');

class ServerRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT ps.*, r.rack_name, at.type_name, rm.room_name
      FROM physical_servers ps
      INNER JOIN racks r ON ps.rack_id = r.id
      INNER JOIN rooms rm ON r.room_id = rm.id
      INNER JOIN asset_types at ON ps.asset_type_id = at.id
      WHERE ps.server_name LIKE ? OR ps.serial_number LIKE ? OR ps.ip_address LIKE ? OR r.rack_name LIKE ?
      ORDER BY ps.id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, searchVal, searchVal, searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total 
      FROM physical_servers ps
      INNER JOIN racks r ON ps.rack_id = r.id
      INNER JOIN rooms rm ON r.room_id = rm.id
      INNER JOIN asset_types at ON ps.asset_type_id = at.id
      WHERE ps.server_name LIKE ? OR ps.serial_number LIKE ? OR ps.ip_address LIKE ? OR r.rack_name LIKE ?
    `;
    const res = await this.query(sql, [searchVal, searchVal, searchVal, searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `
      SELECT ps.*, r.rack_name, at.type_name, rm.room_name
      FROM physical_servers ps
      INNER JOIN racks r ON ps.rack_id = r.id
      INNER JOIN rooms rm ON r.room_id = rm.id
      INNER JOIN asset_types at ON ps.asset_type_id = at.id
      WHERE ps.id = ?
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO physical_servers 
      (rack_id, asset_type_id, server_name, model, serial_number, ip_address, asset_number, rack_position_u, description, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const res = await this.query(sql, [
      data.rack_id,
      data.asset_type_id,
      data.server_name,
      data.model || null,
      data.serial_number || null,
      data.ip_address || null,
      data.asset_number || null,
      data.rack_position_u || null,
      data.description || null,
      data.status || 'active'
    ]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE physical_servers 
      SET rack_id = ?, asset_type_id = ?, server_name = ?, model = ?, serial_number = ?, ip_address = ?, asset_number = ?, rack_position_u = ?, description = ?, status = ? 
      WHERE id = ?
    `;
    await this.query(sql, [
      data.rack_id,
      data.asset_type_id,
      data.server_name,
      data.model || null,
      data.serial_number || null,
      data.ip_address || null,
      data.asset_number || null,
      data.rack_position_u || null,
      data.description || null,
      data.status || 'active',
      id
    ]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM physical_servers WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = ServerRepository;
