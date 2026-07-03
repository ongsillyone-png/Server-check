const BaseRepository = require('./base.repository');

class VmRepository extends BaseRepository {
  static async findAll(search = '', limit = 10, offset = 0) {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT vm.*, ps.server_name as physical_server_name
      FROM virtual_machines vm
      INNER JOIN physical_servers ps ON vm.physical_server_id = ps.id
      WHERE vm.vm_name LIKE ? OR vm.ip_address LIKE ? OR ps.server_name LIKE ?
      ORDER BY vm.id DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.query(sql, [searchVal, searchVal, searchVal, parseInt(limit), parseInt(offset)]);
    return rows;
  }

  static async countAll(search = '') {
    const searchVal = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total 
      FROM virtual_machines vm
      INNER JOIN physical_servers ps ON vm.physical_server_id = ps.id
      WHERE vm.vm_name LIKE ? OR vm.ip_address LIKE ? OR ps.server_name LIKE ?
    `;
    const res = await this.query(sql, [searchVal, searchVal, searchVal]);
    return Number(res[0].total);
  }

  static async findById(id) {
    const sql = `
      SELECT vm.*, ps.server_name as physical_server_name
      FROM virtual_machines vm
      INNER JOIN physical_servers ps ON vm.physical_server_id = ps.id
      WHERE vm.id = ?
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO virtual_machines (physical_server_id, vm_name, ip_address, os_type, description, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const res = await this.query(sql, [
      data.physical_server_id,
      data.vm_name,
      data.ip_address || null,
      data.os_type || null,
      data.description || null,
      data.status || 'running'
    ]);
    return Number(res.insertId);
  }

  static async update(id, data) {
    const sql = `
      UPDATE virtual_machines 
      SET physical_server_id = ?, vm_name = ?, ip_address = ?, os_type = ?, description = ?, status = ? 
      WHERE id = ?
    `;
    await this.query(sql, [
      data.physical_server_id,
      data.vm_name,
      data.ip_address || null,
      data.os_type || null,
      data.description || null,
      data.status || 'running',
      id
    ]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM virtual_machines WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }
}

module.exports = VmRepository;
