const pool = require('../config/database');
const InspectionSessionRepository = require('../repositories/inspection-session.repository');
const InspectionDetailRepository = require('../repositories/inspection-detail.repository');
const InspectionResultRepository = require('../repositories/inspection-result.repository');
const RoomRepository = require('../repositories/room.repository');
const RackRepository = require('../repositories/rack.repository');
const ServerRepository = require('../repositories/server.repository');
const TemplateItemRepository = require('../repositories/template-item.repository');
const SettingRepository = require('../repositories/setting.repository');
const InspectionPhotoRepository = require('../repositories/inspection-photo.repository');

class InspectionService {
  /**
   * Start a walkthrough inspection session or retrieve active one
   */
  static async startSession(inspectorId) {
    const active = await InspectionSessionRepository.findActiveSession();
    if (active) return active;

    // Check how many sessions the inspector has today (excluding canceled)
    const countToday = await InspectionSessionRepository.countSessionsTodayByInspector(inspectorId);

    // Get limit from settings
    const limitSetting = await SettingRepository.findByKey('inspections_per_day');
    const limit = limitSetting ? parseInt(limitSetting.setting_value) : 1;

    if (countToday >= limit) {
      throw new Error(`ไม่สามารถเริ่มรอบการตรวจใหม่ได้ เนื่องจากวันนี้มีการตรวจเช็คครบตามโควตาที่กำหนดแล้ว (${limit} รอบ/วัน) หากต้องการแก้ไขกรุณากดปุ่มแก้ไขในรอบตรวจด้านล่าง`);
    }

    const newSessionId = await InspectionSessionRepository.createSession(inspectorId, inspectorId);
    return await InspectionSessionRepository.findById(newSessionId);
  }

  /**
   * Reopen a completed session for updating
   */
  static async reopenSession(sessionId, userId) {
    const session = await InspectionSessionRepository.findById(sessionId);
    if (!session) throw new Error('ไม่พบรอบการตรวจนี้ในระบบ');
    if (session.status === 'completed') {
      await InspectionSessionRepository.reopenSession(sessionId, userId);
    }
    return await InspectionSessionRepository.findById(sessionId);
  }

  /**
   * Get data for prompt page (today's sessions list and the daily limit)
   */
  static async getPromptData() {
    const todaySessions = await InspectionSessionRepository.findSessionsToday();
    const limitSetting = await SettingRepository.findByKey('inspections_per_day');
    const limit = limitSetting ? parseInt(limitSetting.setting_value) : 1;
    return { todaySessions, limit };
  }

  /**
   * Get active walkthrough session
   */
  static async getActiveSession() {
    return await InspectionSessionRepository.findActiveSession();
}

  /**
   * Get rooms list with inspected vs total servers counts
   */
  static async getRoomsWithStatus(sessionId) {
    // Rooms metadata
    const rooms = await RoomRepository.findAll('', 100, 0); // reuse repository

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
    const [counts] = await pool.query(countsSql, [sessionId]);
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
    SELECT
        r.id,
        r.rack_name,
        r.unit_size,
        r.description,

        COUNT(s.id) AS total_servers,
        SUM(CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END) AS inspected_servers

    FROM racks r

    LEFT JOIN physical_servers s
        ON s.rack_id = r.id
       AND s.deleted_at IS NULL

    LEFT JOIN inspection_details d
        ON d.physical_server_id = s.id
       AND d.session_id = ?
       AND d.deleted_at IS NULL

    WHERE r.room_id = ?
      AND r.deleted_at IS NULL

    GROUP BY
        r.id,
        r.rack_name,
        r.unit_size,
        r.description

    ORDER BY r.rack_name
`;
    const [racks] = await pool.query(racksSql, [sessionId, roomId]);

    return racks.map(rack => ({
      id: Number(rack.id),
      rack_name: rack.rack_name,
      unit_size: Number(rack.unit_size),
      description: rack.description,
      total_servers: Number(rack.total_servers),
      inspected_servers: Number(rack.inspected_servers),
      is_completed:
        Number(rack.total_servers) > 0 &&
        Number(rack.total_servers) === Number(rack.inspected_servers)
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
    const [servers] = await pool.query(sql, [sessionId, rackId]);
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
      WHERE t.is_active = 1 AND t.target_type = 'physical_server' AND ti.is_active = 1 AND ti.deleted_at IS NULL
      ORDER BY ti.sort_order ASC, ti.id ASC
    `;
    const [checklistItems] = await pool.query(templateSql);

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
  static async saveServerInspection(sessionId, serverId, results, serverRemark, userId, filesMap = {}) {
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
      }

      // 3. Create or Update inspection_details
      let detail = await InspectionDetailRepository.findBySessionAndServer(sessionId, serverId);
      let detailId;
      if (detail) {
        detailId = Number(detail.id);
        await InspectionDetailRepository.updateDetail(detailId, overallStatus, serverRemark, userId, conn);
        // Clear previous photo records to avoid orphans/duplicates
        await InspectionPhotoRepository.deletePhotosByDetail(detailId, conn);
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

        const resultId = await InspectionResultRepository.createResult(
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

        // Save photo if result is FAIL and a photo was uploaded
        if (res.result_value === 'fail' && filesMap[res.template_item_id]) {
          await InspectionPhotoRepository.createPhoto(
            detailId,
            resultId,
            filesMap[res.template_item_id],
            userId,
            conn
          );
        }
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

  static async completeSession(sessionId, userId) {
    // Optional check: make sure at least one server has been inspected
    const inspected = await InspectionDetailRepository.findInspectedServersBySession(sessionId);
    if (inspected.length === 0) {
      throw new Error('กรุณาทำการตรวจอุปกรณ์อย่างน้อย 1 เครื่องก่อนส่งมอบงาน');
    }

    await InspectionSessionRepository.completeSession(sessionId, userId);

    // After successfully completing the session, check for FAIL items to trigger LINE notifications
    try {
      const details = await InspectionDetailRepository.findDetailsWithMetadataBySession(sessionId);
      const session = await InspectionSessionRepository.getSessionDetailsForReport(sessionId);

      const NotificationService = require('./notification.service');

      for (const d of details) {
        if (d.overall_status === 'fail') {
          const results = await InspectionResultRepository.findResultsWithPhotosByDetail(d.detail_id);
          for (const r of results) {
            if (r.result_value === 'fail') {
              // Trigger LINE alert and save database notification
              await NotificationService.sendImmediateFailAlert(
                d.server_name,
                d.room_name,
                d.rack_name,
                r.item_name,
                r.remark,
                session ? session.inspector_name : 'Inspector',
                sessionId
              );
            }
          }
        }
      }
    } catch (err) {
      console.error('Error triggering LINE notifications during completeSession:', err.message);
    }
  }

  /**
   * Cancel inspection walkthrough session
   */
  static async cancelSession(sessionId, userId) {
    await InspectionSessionRepository.cancelSession(sessionId, userId);
  }

  /**
   * Fetch filtered list of inspection sessions with pagination metadata
   */
  static async getFilteredHistory(filters, page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const offset = (pageNum - 1) * limitNum;

    const [sessions, totalCount] = await Promise.all([
      InspectionSessionRepository.findSessionsWithFilters({ ...filters, limit: limitNum, offset }),
      InspectionSessionRepository.countSessionsWithFilters(filters)
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

  /**
   * Fetch comprehensive report data for a completed/active session
   */
  static async getSessionReport(sessionId) {
    const session = await InspectionSessionRepository.getSessionDetailsForReport(sessionId);
    if (!session) return null;

    // Fetch detail rows (servers)
    const details = await InspectionDetailRepository.findDetailsWithMetadataBySession(sessionId);

    // Group nested details by Room -> Rack -> Server
    const roomsMap = {};

    for (const d of details) {
      const roomId = Number(d.room_id);
      const rackId = Number(d.rack_id);

      if (!roomsMap[roomId]) {
        roomsMap[roomId] = {
          id: roomId,
          room_name: d.room_name,
          building: d.building,
          floor: d.floor,
          racks: {}
        };
      }

      if (!roomsMap[roomId].racks[rackId]) {
        roomsMap[roomId].racks[rackId] = {
          id: rackId,
          rack_name: d.rack_name,
          servers: []
        };
      }

      // Load results (with photos if any)
      const results = await InspectionResultRepository.findResultsWithPhotosByDetail(d.detail_id);

      roomsMap[roomId].racks[rackId].servers.push({
        detail_id: d.detail_id,
        server_id: d.server_id,
        server_name: d.server_name,
        ip_address: d.ip_address,
        model: d.model,
        rack_position_u: d.rack_position_u,
        overall_status: d.overall_status,
        server_remark: d.server_remark,
        inspected_at: d.inspected_at,
        results
      });
    }

    // Map to array structures
    const rooms = Object.values(roomsMap).map(room => {
      room.racks = Object.values(room.racks);
      return room;
    });

    return {
      session,
      rooms
    };
  }

  /**
   * Fetch matching records formatted for CSV output
   */
  static async getHistoryCSVData(filters) {
    const sessions = await InspectionSessionRepository.findSessionsWithFilters(filters);
    const csvRows = [];

    for (const sess of sessions) {
      const details = await InspectionDetailRepository.findDetailsWithMetadataBySession(sess.session_id);

      for (const d of details) {
        const results = await InspectionResultRepository.findResultsWithPhotosByDetail(d.detail_id);

        for (const r of results) {
          let valueStr = '-';
          if (r.item_type === 'boolean') {
            valueStr = r.boolean_value === 1 ? 'ผ่าน / ปกติ' : 'ไม่ผ่าน / ผิดปกติ';
          } else if (r.item_type === 'numeric') {
            valueStr = r.numeric_value !== null ? `${r.numeric_value}` : '-';
          } else if (r.item_type === 'text') {
            valueStr = r.text_value || '-';
          }

          const statusMap = { 'pass': 'ปกติ / ผ่าน', 'warning': 'เฝ้าระวัง', 'fail': 'ไม่ผ่านเกณฑ์' };
          const resultValueMap = { 'pass': 'ปกติ (PASS)', 'fail': 'ผิดปกติ (FAIL)', 'na': 'ไม่มี / N/A' };

          csvRows.push({
            'รหัสรอบตรวจ': `#${sess.session_id}`,
            'เวลาเริ่มตรวจ': sess.started_at ? new Date(sess.started_at).toLocaleString('th-TH') : '-',
            'เวลาเสร็จสิ้น': sess.completed_at ? new Date(sess.completed_at).toLocaleString('th-TH') : '-',
            'สถานะรอบตรวจ': sess.session_status === 'completed' ? 'เสร็จสมบูรณ์' : 'กำลังดำเนินการ',
            'ผู้ตรวจสอบ': sess.inspector_name,
            'ห้องเซิร์ฟเวอร์': d.room_name,
            'ตู้แร็ค': d.rack_name,
            'เครื่องเซิร์ฟเวอร์': d.server_name,
            'สถานะเซิร์ฟเวอร์': statusMap[d.overall_status] || d.overall_status,
            'หมายเหตุเซิร์ฟเวอร์': d.server_remark || '-',
            'รายการตรวจสอบ': r.item_name,
            'ผลตรวจสอบรายข้อ': resultValueMap[r.result_value] || r.result_value,
            'ค่าที่กรอก/วัดได้': valueStr,
            'หมายเหตุรายข้อ': r.remark || '-'
          });
        }
      }
    }

    return csvRows;
  }

  static async getHistoryFilterOptions() {
    const rooms = await RoomRepository.findAll('', 1000, 0);
    const RackRepository = require('../repositories/rack.repository');
    const ServerRepository = require('../repositories/server.repository');
    const UserRepository = require('../repositories/user.repository');

    const [racks, servers, users] = await Promise.all([
      RackRepository.findAll('', 1000, 0),
      ServerRepository.findAll('', 1000, 0),
      UserRepository.findAll('', 1000, 0)
    ]);

    // Convert BigInt IDs to Number and extract only required fields to avoid JSON.stringify BigInt serialization issues in EJS
    const safeRooms = rooms.map(rm => ({
      id: Number(rm.id),
      room_name: rm.room_name
    }));

    const safeRacks = racks.map(r => ({
      id: Number(r.id),
      room_id: Number(r.room_id),
      rack_name: r.rack_name
    }));

    const safeServers = servers.map(s => ({
      id: Number(s.id),
      rack_id: Number(s.rack_id),
      server_name: s.server_name
    }));

    return { rooms: safeRooms, racks: safeRacks, servers: safeServers, users };
  }
}

module.exports = InspectionService;
