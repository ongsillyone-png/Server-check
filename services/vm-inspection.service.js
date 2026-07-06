const pool = require('../config/database');
const BaseRepository = require('../repositories/base.repository');
const VmInspectionSessionRepository = require('../repositories/vm-inspection-session.repository');
const VmInspectionDetailRepository = require('../repositories/vm-inspection-detail.repository');
const VmInspectionResultRepository = require('../repositories/vm-inspection-result.repository');
const SettingRepository = require('../repositories/setting.repository');

class VmInspectionService {
  /**
   * Start a new VM inspection session, or return existing active session
   */
  static async startSession(inspectorId) {
    const active = await VmInspectionSessionRepository.findActiveSessionByInspector(inspectorId);
    if (active) return active;

    const countToday = await VmInspectionSessionRepository.countSessionsTodayByInspector(inspectorId);
    const limitSetting = await SettingRepository.findByKey('inspections_per_day');
    const limit = limitSetting ? parseInt(limitSetting.setting_value) : 1;

    if (countToday >= limit) {
      throw new Error(`ไม่สามารถเริ่มรอบตรวจ VM ใหม่ได้ เนื่องจากวันนี้มีการตรวจครบโควตาแล้ว (${limit} รอบ/วัน)`);
    }

    const newSessionId = await VmInspectionSessionRepository.createSession(inspectorId, inspectorId);
    return await VmInspectionSessionRepository.findById(newSessionId);
  }

  /**
   * Get active VM session for inspector
   */
  static async getActiveSession() {
    return await VmInspectionSessionRepository.findActiveSession();
}
  /**
   * Get data for VM prompt page
   */
  static async getPromptData() {
    const todaySessions = await VmInspectionSessionRepository.findSessionsToday();
    const limitSetting = await SettingRepository.findByKey('inspections_per_day');
    const limit = limitSetting ? parseInt(limitSetting.setting_value) : 1;
    return { todaySessions, limit };
  }

  /**
   * Reopen a completed VM session
   */
  static async reopenSession(sessionId, userId) {
    const session = await VmInspectionSessionRepository.findById(sessionId);
    if (!session) throw new Error('ไม่พบรอบการตรวจ VM นี้ในระบบ');
    if (session.status === 'completed') {
      await VmInspectionSessionRepository.reopenSession(sessionId, userId);
    }
    return await VmInspectionSessionRepository.findById(sessionId);
  }

  /**
   * Cancel VM inspection session
   */
  static async cancelSession(sessionId, userId) {
    await VmInspectionSessionRepository.cancelSession(sessionId, userId);
  }

  /**
   * Get physical server hosts and their VM counts/status for a session
   * Step 1: เลือก Physical Server Host
   */
  static async getHostsWithVmStatus(sessionId) {
    const sql = `
      SELECT 
        ps.id as host_id,
        ps.server_name as host_name,
        ps.ip_address as host_ip,
        ps.model,
        rm.room_name,
        rm.building,
        rm.floor,
        COUNT(vm.id) as total_vms,
        SUM(CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END) as inspected_vms
      FROM physical_servers ps
      JOIN racks rk ON ps.rack_id = rk.id
      JOIN rooms rm ON rk.room_id = rm.id
      INNER JOIN virtual_machines vm ON vm.physical_server_id = ps.id AND vm.deleted_at IS NULL
      LEFT JOIN vm_inspection_details d ON d.vm_id = vm.id AND d.session_id = ? AND d.deleted_at IS NULL
      WHERE ps.deleted_at IS NULL AND vm.deleted_at IS NULL
      GROUP BY ps.id, ps.server_name, ps.ip_address, ps.model, rm.room_name, rm.building, rm.floor
      HAVING COUNT(vm.id) > 0
      ORDER BY rm.room_name ASC, ps.server_name ASC
    `;
    const hosts = await BaseRepository.query(sql, [sessionId]);
    return hosts.map(h => ({
      host_id: Number(h.host_id),
      host_name: h.host_name,
      host_ip: h.host_ip,
      model: h.model,
      room_name: h.room_name,
      building: h.building,
      floor: h.floor,
      total_vms: Number(h.total_vms),
      inspected_vms: Number(h.inspected_vms),
      is_completed: Number(h.total_vms) > 0 && Number(h.total_vms) === Number(h.inspected_vms)
    }));
  }

  /**
   * Get VMs on a specific host with inspection status
   * Step 2: เลือก VM
   */
  static async getVmsByHostWithStatus(sessionId, hostId) {
    const sql = `
      SELECT vm.*,
        d.id as detail_id,
        d.status as inspection_status,
        d.remark as inspection_remark
      FROM virtual_machines vm
      LEFT JOIN vm_inspection_details d ON d.vm_id = vm.id AND d.session_id = ? AND d.deleted_at IS NULL
      WHERE vm.physical_server_id = ? AND vm.deleted_at IS NULL
      ORDER BY vm.vm_name ASC
    `;
    const vms = await BaseRepository.query(sql, [sessionId, hostId]);
    return vms.map(vm => ({
      id: Number(vm.id),
      vm_name: vm.vm_name,
      ip_address: vm.ip_address,
      os_type: vm.os_type,
      status: vm.status,
      description: vm.description,
      inspected: vm.detail_id !== null,
      inspection_status: vm.inspection_status || 'pending',
      inspection_remark: vm.inspection_remark || ''
    }));
  }

  /**
   * Get active VM template items + load previous results if already inspected
   * Step 3: Checklist
   */
  static async getChecklistForVm(sessionId, vmId) {
    // ดึง items จาก template ที่ target_type = 'vm' และ active
    const templateSql = `
      SELECT ti.*
      FROM inspection_template_items ti
      JOIN inspection_templates t ON ti.template_id = t.id
      WHERE t.is_active = 1 
        AND t.target_type = 'vm'
        AND ti.is_active = 1 
        AND ti.deleted_at IS NULL
      ORDER BY ti.sort_order ASC, ti.id ASC
    `;
    const checklistItems = await BaseRepository.query(templateSql);

    // โหลดผลเดิมถ้าเคยตรวจแล้ว
    const detail = await VmInspectionDetailRepository.findBySessionAndVm(sessionId, vmId);
    let previousResults = {};
    let remark = '';
    let overallStatus = 'pass';

    if (detail) {
      remark = detail.remark || '';
      overallStatus = detail.status;
      const results = await VmInspectionResultRepository.findResultsByDetail(detail.id);
      results.forEach(res => {
        previousResults[Number(res.template_item_id)] = {
          result_value: res.result_value,
          boolean_value: res.boolean_value,
          numeric_value: res.numeric_value !== null ? Number(res.numeric_value) : null,
          text_value: res.text_value,
          remark: res.remark
        };
      });
    }

    return {
      items: checklistItems.map(item => ({
        id: Number(item.id),
        item_name: item.item_name,
        description: item.description,
        item_type: item.item_type,
        sort_order: Number(item.sort_order),
        previous: previousResults[Number(item.id)] || null
      })),
      overall_status: overallStatus,
      remark: remark
    };
  }

  /**
   * Save checklist results for a VM (with transaction rollback)
   */
  static async saveVmInspection(sessionId, vmId, results, vmRemark, userId) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // คำนวณ overall status
      let overallStatus = 'pass';
      for (const res of results) {
        if (res.result_value === 'fail') {
          overallStatus = 'fail';
          break;
        }
      }

      // Create or Update vm_inspection_details
      let detail = await VmInspectionDetailRepository.findBySessionAndVm(sessionId, vmId);
      let detailId;
      if (detail) {
        detailId = Number(detail.id);
        await VmInspectionDetailRepository.updateDetail(detailId, overallStatus, vmRemark, userId, conn);
        await VmInspectionResultRepository.deleteResultsByDetail(detailId, conn);
      } else {
        detailId = await VmInspectionDetailRepository.createDetail(sessionId, vmId, overallStatus, vmRemark, userId, conn);
      }

      // บันทึกผลรายข้อ
      for (const res of results) {
        let boolVal = null;
        let numVal = null;
        let txtVal = null;

        if (res.item_type === 'boolean') {
          boolVal = res.result_value === 'pass' ? 1 : 0;
        } else if (res.item_type === 'numeric') {
          numVal = res.numeric_value ? parseFloat(res.numeric_value) : null;
        } else if (res.item_type === 'text') {
          txtVal = res.text_value;
        }

        await VmInspectionResultRepository.createResult(
          detailId,
          res.template_item_id,
          res.result_value,
          boolVal,
          numVal,
          txtVal,
          res.remark || null,
          userId,
          conn
        );
      }

      await conn.commit();
      return { success: true, overallStatus };

    } catch (err) {
      if (conn) {
        console.error('Rolling back VM inspection transaction due to error:', err.message);
        await conn.rollback();
      }
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Complete a VM inspection session
   */
  static async completeSession(sessionId, userId) {
    const inspected = await VmInspectionDetailRepository.findInspectedVmsBySession(sessionId);
    if (inspected.length === 0) {
      throw new Error('กรุณาทำการตรวจ VM อย่างน้อย 1 เครื่องก่อนส่งมอบงาน');
    }
    await VmInspectionSessionRepository.completeSession(sessionId, userId);
  }

  /**
   * Fetch filtered list of VM inspection sessions with pagination metadata
   */
  static async getFilteredHistory(filters, page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const offset = (pageNum - 1) * limitNum;

    const [sessions, totalCount] = await Promise.all([
      VmInspectionSessionRepository.findSessionsWithFilters({ ...filters, limit: limitNum, offset }),
      VmInspectionSessionRepository.countSessionsWithFilters(filters)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    };
  }
}

module.exports = VmInspectionService;
