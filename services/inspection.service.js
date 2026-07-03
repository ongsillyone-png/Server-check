const pool = require('../config/database');
const InspectionSessionRepository = require('../repositories/inspection-session.repository');
const InspectionDetailRepository = require('../repositories/inspection-detail.repository');
const InspectionResultRepository = require('../repositories/inspection-result.repository');
const RoomRepository = require('../repositories/room.repository');
const RackRepository = require('../repositories/rack.repository');
const ServerRepository = require('../repositories/server.repository');
const TemplateItemRepository = require('../repositories/template-item.repository');

class InspectionService {
  /**
   * Start a walkthrough inspection session or retrieve active one
   */
  static async startSession(inspectorId) {
    const active = await InspectionSessionRepository.findActiveSessionByInspector(inspectorId);
    if (active) return active;

    const newSessionId = await InspectionSessionRepository.createSession(inspectorId, inspectorId);
    return await InspectionSessionRepository.findById(newSessionId);
  }

  /**
   * Get active walkthrough session
   */
  static async getActiveSession(inspectorId) {
    return await InspectionSessionRepository.findActiveSessionByInspector(inspectorId);
  }

  /**
   * Get rooms list with inspected vs total servers counts
   */
  static async getRoomsWithStatus(sessionId) {
    // Rooms metadata
    const rooms = await RoomRepository.findAll('', 1, 100); // reuse repository
    
    // Get counts per room
    const countsSql = `
      SELECT 
        rk.room_id,
        COUNT(s.id) as total_servers,
        SUM(CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END) as inspected_servers
      FROM physical_servers s
      JOIN racks rk ON s.rack_id = rk.id
      LEFT JOIN inspection_details d ON d.physical_server_id = s.id AND d.session_id = ? AND d.deleted_at IS NULL
      WHERE s.deleted_at IS NULL
      GROUP BY rk.room_id
    `;
    const counts = await pool.query(countsSql, [sessionId]);
    const countsMap = counts.reduce((acc, row) => {
      acc[Number(row.room_id)] = {
        total: Number(row.total_servers),
        inspected: Number(row.inspected_servers)
      };
      return acc;
    }, {});

    return rooms.map(room => {
      const roomCounts = countsMap[Number(room.id)] || { total: 0, inspected: 0 };
      return {
        ...room,
        total_servers: roomCounts.total,
        inspected_servers: roomCounts.inspected,
        is_completed: roomCounts.total > 0 && roomCounts.total === roomCounts.inspected
      };
    });
  }

  /**
   * Get racks with inspected vs total servers count
   */
  static async getRacksByRoomWithStatus(sessionId, roomId) {
    const racksSql = `
      SELECT r.*,
        COUNT(s.id) as total_servers,
        SUM(CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END) as inspected_servers
      FROM racks r
      LEFT JOIN physical_servers s ON s.rack_id = r.id AND s.deleted_at IS NULL
      LEFT JOIN inspection_details d ON d.physical_server_id = s.id AND d.session_id = ? AND d.deleted_at IS NULL
      WHERE r.room_id = ? AND r.deleted_at IS NULL
      GROUP BY r.id
    `;
    const racks = await pool.query(racksSql, [sessionId, roomId]);
    return racks.map(rack => ({
      id: Number(rack.id),
      rack_name: rack.rack_name,
      unit_size: Number(rack.unit_size),
      description: rack.description,
      total_servers: Number(rack.total_servers),
      inspected_servers: Number(rack.inspected_servers),
      is_completed: Number(rack.total_servers) > 0 && Number(rack.total_servers) === Number(rack.inspected_servers)
    }));
  }

  /**
   * Get physical servers inside a rack with inspection status details
   */
  static async getServersByRackWithStatus(sessionId, rackId) {
    const sql = `
      SELECT s.*, t.type_name,
        d.id as detail_id,
        d.status as inspection_status,
        d.remark as inspection_remark
      FROM physical_servers s
      JOIN asset_types t ON s.asset_type_id = t.id
      LEFT JOIN inspection_details d ON d.physical_server_id = s.id AND d.session_id = ? AND d.deleted_at IS NULL
      WHERE s.rack_id = ? AND s.deleted_at IS NULL
      ORDER BY s.rack_position_u DESC
    `;
    const servers = await pool.query(sql, [sessionId, rackId]);
    return servers.map(srv => ({
      id: Number(srv.id),
      server_name: srv.server_name,
      model: srv.model,
      serial_number: srv.serial_number,
      ip_address: srv.ip_address,
      type_name: srv.type_name,
      rack_position_u: srv.rack_position_u,
      inspected: srv.detail_id !== null,
      status: srv.inspection_status || 'pending',
      remark: srv.inspection_remark || ''
    }));
  }

  /**
   * Fetch active checklist template items and load any previous result
   */
  static async getChecklistForServer(sessionId, serverId) {
    // 1. Get active checklist template items
    const templateSql = `
      SELECT ti.*
      FROM inspection_template_items ti
      JOIN inspection_templates t ON ti.template_id = t.id
      WHERE t.is_active = 1 AND ti.is_active = 1 AND ti.deleted_at IS NULL
      ORDER BY ti.sort_order ASC, ti.id ASC
    `;
    const checklistItems = await pool.query(templateSql);

    // 2. Check if already inspected, if so get detail and answers
    const detail = await InspectionDetailRepository.findBySessionAndServer(sessionId, serverId);
    let previousResults = {};
    let remark = '';
    let overallStatus = 'pass';

    if (detail) {
      remark = detail.remark || '';
      overallStatus = detail.status;
      const results = await InspectionResultRepository.findResultsByDetail(detail.id);
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
   * Save checklist answers for a specific server (with automatic transaction rollback)
   */
  static async saveServerInspection(sessionId, serverId, results, serverRemark, userId) {
    let conn;
    try {
      // 1. Acquire single connection for database transaction block
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // 2. Determine overall server inspection status: if any item fails, status = 'fail'. If any item NA/warning status = 'warning', otherwise 'pass'
      let overallStatus = 'pass';
      for (const res of results) {
        if (res.result_value === 'fail') {
          overallStatus = 'fail';
          break; // Fail overrides everything
        }
        if (res.result_value === 'na') {
          // You can treat N/A as pass or warning based on preference; standard is pass/no warning.
          // Let's keep status as pass unless a failure exists.
        }
      }

      // 3. Create or Update inspection_details
      let detail = await InspectionDetailRepository.findBySessionAndServer(sessionId, serverId);
      let detailId;
      if (detail) {
        detailId = Number(detail.id);
        await InspectionDetailRepository.updateDetail(detailId, overallStatus, serverRemark, userId, conn);
        // Clear previous results to avoid duplicates
        await InspectionResultRepository.deleteResultsByDetail(detailId, conn);
      } else {
        detailId = await InspectionDetailRepository.createDetail(sessionId, serverId, overallStatus, serverRemark, userId, conn);
      }

      // 4. Save individual results
      for (const res of results) {
        let boolVal = null;
        let numVal = null;
        let txtVal = null;

        // Populate fields based on EJS input types
        if (res.item_type === 'boolean') {
          boolVal = res.result_value === 'pass' ? 1 : 0;
        } else if (res.item_type === 'numeric') {
          numVal = res.numeric_value ? parseFloat(res.numeric_value) : null;
        } else if (res.item_type === 'text') {
          txtVal = res.text_value;
        }

        await InspectionResultRepository.createResult(
          detailId,
          res.template_item_id,
          res.result_value, // 'pass', 'fail', 'na'
          boolVal,
          numVal,
          txtVal,
          res.remark || null,
          userId,
          conn
        );
      }

      // 5. Commit transaction
      await conn.commit();
      return { success: true, overallStatus };

    } catch (err) {
      // 6. Rollback in case of database failures
      if (conn) {
        console.error('Rolling back server inspection transaction group due to error:', err.message);
        await conn.rollback();
      }
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Complete inspection walkthrough session
   */
  static async completeSession(sessionId, userId) {
    // Optional check: make sure at least one server has been inspected
    const inspected = await InspectionDetailRepository.findInspectedServersBySession(sessionId);
    if (inspected.length === 0) {
      throw new Error('กรุณาทำการตรวจอุปกรณ์อย่างน้อย 1 เครื่องก่อนส่งมอบงาน');
    }

    await InspectionSessionRepository.completeSession(sessionId, userId);
  }

  /**
   * Cancel inspection walkthrough session
   */
  static async cancelSession(sessionId, userId) {
    await InspectionSessionRepository.cancelSession(sessionId, userId);
  }
}

module.exports = InspectionService;
