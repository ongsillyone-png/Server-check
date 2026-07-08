const BaseRepository = require('./base.repository');

// ── Fixed checklist definitions ────────────────────────────────────────────
const ROOM_CHECKS = [
  { key: 'door_closed',      label: 'ประตูห้อง Server ปิดสนิทและล็อคแล้ว' },
  { key: 'emergency_light',  label: 'ไฟฉุกเฉินทำงานปกติ' },
  { key: 'fire_suppression', label: 'ระบบ Fire Suppression / สัญญาณเตือนไฟไหม้ทำงาน' },
  { key: 'no_water_leak',    label: 'ไม่มีน้ำรั่วซึมหรือความชื้นผิดปกติในห้อง' },
  { key: 'cleanliness',      label: 'ห้องสะอาด ไม่มีฝุ่นหรือสิ่งแปลกปลอม' },
  { key: 'cctv_working',     label: 'กล้อง CCTV ทำงานปกติและภาพชัดเจน' },
];

const RACK_CHECKS = [
  { key: 'door_closed',      label: 'ประตูตู้ Rack ปิดสนิท' },
  { key: 'cable_management', label: 'Cable Management เป็นระเบียบ ไม่กีดขวางอากาศ' },
  { key: 'blank_panels',     label: 'Blank Panel ติดตั้งครบในช่องว่าง' },
  { key: 'no_error_led',     label: 'ไม่มี Error LED / Alarm light บนอุปกรณ์' },
  { key: 'fan_working',      label: 'พัดลมระบายอากาศตู้ทำงานปกติ ไม่มีเสียงผิดปกติ' },
  { key: 'mounting_secure',  label: 'อุปกรณ์ยึดติดแน่นหนา ไม่มีการเลื่อนหลุด' },
];

class EnvInspectionRepository {

  static getRoomChecks() { return ROOM_CHECKS; }
  static getRackChecks() { return RACK_CHECKS; }

  // ── Sessions ───────────────────────────────────────────────────────────

  static async findActiveSession() {
  const sql = `
    SELECT s.*, r.room_name, u.name AS inspector_name
    FROM env_inspection_sessions s
    JOIN rooms r ON s.room_id = r.id
    JOIN users u ON s.inspector_id = u.id
    WHERE s.status = 'in_progress'
      AND s.deleted_at IS NULL
    LIMIT 1
  `;
  const rows = await BaseRepository.query(sql);
  return rows.length > 0 ? rows[0] : null;
}
  

  static async findById(id) {
    const sql = `
      SELECT s.*, r.room_name, u.name AS inspector_name
      FROM env_inspection_sessions s
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON s.inspector_id = u.id
      WHERE s.id = ? AND s.deleted_at IS NULL LIMIT 1`;
    const rows = await BaseRepository.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async createSession(roomId, inspectorId, createdBy, conn = null) {
    const sql = `INSERT INTO env_inspection_sessions (room_id, inspector_id, status, created_by, updated_by)
                 VALUES (?, ?, 'in_progress', ?, ?)`;
    const result = await BaseRepository.query(sql, [roomId, inspectorId, createdBy, createdBy], conn);
    return Number(result.insertId);
  }

  static async completeSession(id, overallStatus, tempC, humidityPct, notes, updatedBy, conn = null) {
    const sql = `UPDATE env_inspection_sessions
                 SET status='completed', completed_at=CURRENT_TIMESTAMP,
                     overall_status=?, temperature_c=?, humidity_pct=?, notes=?, updated_by=?
                 WHERE id=? AND deleted_at IS NULL`;
    await BaseRepository.query(sql, [overallStatus, tempC || null, humidityPct || null, notes || null, updatedBy, id], conn);
  }

  static async cancelSession(id, updatedBy, conn = null) {
    const sql = `UPDATE env_inspection_sessions
                 SET status='canceled', completed_at=CURRENT_TIMESTAMP, updated_by=?
                 WHERE id=? AND deleted_at IS NULL`;
    await BaseRepository.query(sql, [updatedBy, id], conn);
  }

  static async reopenSession(id, updatedBy, conn = null) {
    const sql = `UPDATE env_inspection_sessions
                 SET status='in_progress', completed_at=NULL, overall_status=NULL, updated_by=?
                 WHERE id=? AND deleted_at IS NULL`;
    await BaseRepository.query(sql, [updatedBy, id], conn);
  }

  static async findSessionsToday() {
    const sql = `
      SELECT s.*, r.room_name, u.name AS inspector_name
      FROM env_inspection_sessions s
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON s.inspector_id = u.id
      WHERE DATE(s.started_at) = CURDATE() AND s.status != 'canceled' AND s.deleted_at IS NULL
      ORDER BY s.id ASC`;
    return await BaseRepository.query(sql);
  }

  static async countSessionsTodayByInspector(inspectorId) {
    const sql = `SELECT COUNT(*) AS cnt FROM env_inspection_sessions
                 WHERE inspector_id=? AND DATE(started_at)=CURDATE()
                   AND status != 'canceled' AND deleted_at IS NULL`;
    const rows = await BaseRepository.query(sql, [inspectorId]);
    return Number(rows[0].cnt);
  }

  // ── Room Checks ────────────────────────────────────────────────────────

  static async upsertRoomCheck(sessionId, checkKey, checkLabel, result, remark, conn = null) {
    const sql = `INSERT INTO env_inspection_room_checks (session_id, check_key, check_label, result, remark)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE result=VALUES(result), remark=VALUES(remark), updated_at=CURRENT_TIMESTAMP`;
    await BaseRepository.query(sql, [sessionId, checkKey, checkLabel, result, remark || null], conn);
  }

  static async findRoomChecks(sessionId) {
    const sql = `SELECT * FROM env_inspection_room_checks WHERE session_id=? ORDER BY id ASC`;
    return await BaseRepository.query(sql, [sessionId]);
  }

  // ── Rack Checks ────────────────────────────────────────────────────────

  static async upsertRackCheck(sessionId, rackId, checkKey, checkLabel, result, remark, conn = null) {
    const sql = `INSERT INTO env_inspection_rack_checks (session_id, rack_id, check_key, check_label, result, remark)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE result=VALUES(result), remark=VALUES(remark), updated_at=CURRENT_TIMESTAMP`;
    await BaseRepository.query(sql, [sessionId, rackId, checkKey, checkLabel, result, remark || null], conn);
  }

  static async findRackChecks(sessionId) {
    const sql = `SELECT rc.*, r.rack_name FROM env_inspection_rack_checks rc
                 JOIN racks r ON rc.rack_id = r.id
                 WHERE rc.session_id=? ORDER BY r.rack_name ASC, rc.check_key ASC`;
    return await BaseRepository.query(sql, [sessionId]);
  }

  static async findRackChecksByRack(sessionId, rackId) {
    const sql = `SELECT * FROM env_inspection_rack_checks
                 WHERE session_id=? AND rack_id=? ORDER BY id ASC`;
    return await BaseRepository.query(sql, [sessionId, rackId]);
  }

  // ── Cooling Logs ───────────────────────────────────────────────────────

  static async saveCoolingLog(sessionId, name, type, status, tempIn, tempOut, remark, conn = null) {
    const sql = `INSERT INTO env_inspection_cooling_logs
                   (session_id, equipment_name, equipment_type, status, temperature_in_c, temperature_out_c, remark)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await BaseRepository.query(
      sql, [sessionId, name, type, status, tempIn || null, tempOut || null, remark || null], conn
    );
    return Number(result.insertId);
  }

  static async deleteCoolingLogsBySession(sessionId, conn = null) {
    await BaseRepository.query(`DELETE FROM env_inspection_cooling_logs WHERE session_id=?`, [sessionId], conn);
  }

  static async findCoolingLogs(sessionId) {
    const sql = `SELECT * FROM env_inspection_cooling_logs WHERE session_id=? ORDER BY id ASC`;
    return await BaseRepository.query(sql, [sessionId]);
  }

  // ── History / Filters ──────────────────────────────────────────────────

  static async findSessionsWithFilters({ startDate, endDate, roomId, inspectorId, overallStatus, limit, offset }) {
    let sql = `
      SELECT s.id, s.room_id, s.started_at, s.completed_at, s.status, s.overall_status,
             s.temperature_c, s.humidity_pct, s.notes,
             r.room_name, u.name AS inspector_name
      FROM env_inspection_sessions s
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON s.inspector_id = u.id
      WHERE s.deleted_at IS NULL AND s.status != 'canceled'`;
    const params = [];
    if (startDate)     { sql += ' AND s.started_at >= ?';    params.push(startDate + ' 00:00:00'); }
    if (endDate)       { sql += ' AND s.started_at <= ?';    params.push(endDate   + ' 23:59:59'); }
    if (roomId)        { sql += ' AND s.room_id = ?';        params.push(Number(roomId)); }
    if (inspectorId)   { sql += ' AND s.inspector_id = ?';   params.push(Number(inspectorId)); }
    if (overallStatus) { sql += ' AND s.overall_status = ?'; params.push(overallStatus); }
    sql += ' ORDER BY s.id DESC';
    if (limit !== undefined && offset !== undefined) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));
    }
    return await BaseRepository.query(sql, params);
  }

  static async countSessionsWithFilters({ startDate, endDate, roomId, inspectorId, overallStatus }) {
    let sql = `SELECT COUNT(*) AS cnt FROM env_inspection_sessions s
               WHERE s.deleted_at IS NULL AND s.status != 'canceled'`;
    const params = [];
    if (startDate)     { sql += ' AND s.started_at >= ?';    params.push(startDate + ' 00:00:00'); }
    if (endDate)       { sql += ' AND s.started_at <= ?';    params.push(endDate   + ' 23:59:59'); }
    if (roomId)        { sql += ' AND s.room_id = ?';        params.push(Number(roomId)); }
    if (inspectorId)   { sql += ' AND s.inspector_id = ?';   params.push(Number(inspectorId)); }
    if (overallStatus) { sql += ' AND s.overall_status = ?'; params.push(overallStatus); }
    const rows = await BaseRepository.query(sql, params);
    return Number(rows[0].cnt);
  }

  // ── Dashboard summary ──────────────────────────────────────────────────

  static async getDashboardSummary() {
    const sql = `
      SELECT
        SUM(CASE WHEN DATE(started_at)=CURDATE() AND status='completed' AND overall_status='pass'    THEN 1 ELSE 0 END) AS today_pass,
        SUM(CASE WHEN DATE(started_at)=CURDATE() AND status='completed' AND overall_status='warning' THEN 1 ELSE 0 END) AS today_warning,
        SUM(CASE WHEN DATE(started_at)=CURDATE() AND status='completed' AND overall_status='fail'    THEN 1 ELSE 0 END) AS today_fail,
        SUM(CASE WHEN DATE(started_at)=CURDATE() AND status='in_progress'                            THEN 1 ELSE 0 END) AS today_pending,
        ROUND(AVG(CASE WHEN DATE(started_at)=CURDATE() AND temperature_c IS NOT NULL THEN temperature_c END),1) AS avg_temp_today
      FROM env_inspection_sessions
      WHERE deleted_at IS NULL AND status != 'canceled'`;
    const rows = await BaseRepository.query(sql);
    return rows[0];
  }

  // ── Lookup helpers ─────────────────────────────────────────────────────

  static async findAllRooms() {
    return await BaseRepository.query(
      `SELECT id, room_name FROM rooms WHERE deleted_at IS NULL ORDER BY room_name ASC`
    );
  }

  static async findRacksByRoom(roomId) {
    return await BaseRepository.query(
      `SELECT id, rack_name FROM racks WHERE room_id=? AND deleted_at IS NULL ORDER BY rack_name ASC`,
      [roomId]
    );
  }

  static async findAllUsers() {
    return await BaseRepository.query(
      `SELECT id, name FROM users WHERE deleted_at IS NULL ORDER BY name ASC`
    );
  }
}

module.exports = EnvInspectionRepository;
