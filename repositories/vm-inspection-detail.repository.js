const BaseRepository = require('./base.repository');

class VmInspectionDetailRepository {
  /**
   * Find VM inspection detail for a VM within a session
   */
  static async findBySessionAndVm(sessionId, vmId) {
    const sql = `
      SELECT * FROM vm_inspection_details 
      WHERE session_id = ? AND vm_id = ? AND deleted_at IS NULL 
      LIMIT 1
    `;
    const rows = await BaseRepository.query(sql, [sessionId, vmId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create a VM inspection detail entry
   */
  static async createDetail(sessionId, vmId, status, remark, createdBy, connection = null) {
    const sql = `
      INSERT INTO vm_inspection_details (session_id, vm_id, status, remark, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await BaseRepository.query(sql, [sessionId, vmId, status, remark, createdBy, createdBy], connection);
    return Number(result.insertId);
  }

  /**
   * Update existing VM detail entry
   */
  static async updateDetail(id, status, remark, updatedBy, connection = null) {
    const sql = `
      UPDATE vm_inspection_details 
      SET status = ?, remark = ?, updated_by = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;
    await BaseRepository.query(sql, [status, remark, updatedBy, id], connection);
  }

  /**
   * Get list of VMs already inspected in this session
   */
  static async findInspectedVmsBySession(sessionId) {
    const sql = `
      SELECT vm_id, status, remark 
      FROM vm_inspection_details 
      WHERE session_id = ? AND deleted_at IS NULL
    `;
    return await BaseRepository.query(sql, [sessionId]);
  }

  /**
   * Get detailed VM inspection entries with metadata (vm name, host, etc.)
   */
  static async findDetailsWithMetadataBySession(sessionId) {
    const sql = `
      SELECT d.id as detail_id,
             d.status as overall_status,
             d.remark as vm_remark,
             d.created_at as inspected_at,
             vm.id as vm_id,
             vm.vm_name,
             vm.ip_address,
             vm.os_type,
             vm.status as vm_status,
             ps.id as host_id,
             ps.server_name as host_name
      FROM vm_inspection_details d
      JOIN virtual_machines vm ON d.vm_id = vm.id
      JOIN physical_servers ps ON vm.physical_server_id = ps.id
      WHERE d.session_id = ? AND d.deleted_at IS NULL AND vm.deleted_at IS NULL
      ORDER BY ps.server_name ASC, vm.vm_name ASC
    `;
    return await BaseRepository.query(sql, [sessionId]);
  }
}

module.exports = VmInspectionDetailRepository;
