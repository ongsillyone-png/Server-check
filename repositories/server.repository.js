const BaseRepository = require('./base.repository');

class ServerRepository extends BaseRepository {
  static async findAll(filters = {}, limit = 10, offset = 0) {
    let search = '';
    let roomId = '';
    let rackId = '';
    let assetTypeId = '';

    if (typeof filters === 'string') {
      search = filters;
    } else if (filters) {
      search = filters.search || '';
      roomId = filters.roomId || '';
      rackId = filters.rackId || '';
      assetTypeId = filters.assetTypeId || '';
    }

    const searchVal = `%${search}%`;
    let sql = `
      SELECT ps.*, r.rack_name, at.type_name, rm.room_name
      FROM physical_servers ps
      INNER JOIN racks r ON ps.rack_id = r.id
      INNER JOIN rooms rm ON r.room_id = rm.id
      INNER JOIN asset_types at ON ps.asset_type_id = at.id
      WHERE (ps.server_name LIKE ? OR ps.serial_number LIKE ? OR ps.ip_address LIKE ? OR r.rack_name LIKE ?)
    `;
    const params = [searchVal, searchVal, searchVal, searchVal];

    if (roomId) {
      sql += ` AND r.room_id = ?`;
      params.push(Number(roomId));
    }
    if (rackId) {
      sql += ` AND ps.rack_id = ?`;
      params.push(Number(rackId));
    }
    if (assetTypeId) {
      sql += ` AND ps.asset_type_id = ?`;
      params.push(Number(assetTypeId));
    }

    sql += ` ORDER BY ps.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const rows = await this.query(sql, params);
    return rows;
  }

  static async countAll(filters = {}) {
    let search = '';
    let roomId = '';
    let rackId = '';
    let assetTypeId = '';

    if (typeof filters === 'string') {
      search = filters;
    } else if (filters) {
      search = filters.search || '';
      roomId = filters.roomId || '';
      rackId = filters.rackId || '';
      assetTypeId = filters.assetTypeId || '';
    }

    const searchVal = `%${search}%`;
    let sql = `
      SELECT COUNT(*) as total 
      FROM physical_servers ps
      INNER JOIN racks r ON ps.rack_id = r.id
      INNER JOIN rooms rm ON r.room_id = rm.id
      INNER JOIN asset_types at ON ps.asset_type_id = at.id
      WHERE (ps.server_name LIKE ? OR ps.serial_number LIKE ? OR ps.ip_address LIKE ? OR r.rack_name LIKE ?)
    `;
    const params = [searchVal, searchVal, searchVal, searchVal];

    if (roomId) {
      sql += ` AND r.room_id = ?`;
      params.push(Number(roomId));
    }
    if (rackId) {
      sql += ` AND ps.rack_id = ?`;
      params.push(Number(rackId));
    }
    if (assetTypeId) {
      sql += ` AND ps.asset_type_id = ?`;
      params.push(Number(assetTypeId));
    }

    const res = await this.query(sql, params);
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
