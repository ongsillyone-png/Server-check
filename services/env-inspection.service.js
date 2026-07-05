const EnvRepo = require('../repositories/env-inspection.repository');

// ── Constants ────────────────────────────────────────────────────────────────
const DAILY_LIMIT = 5; // รอบตรวจสภาพแวดล้อมสูงสุดต่อวันต่อคน

class EnvInspectionService {

  // ── Prompt page data ───────────────────────────────────────────────────────

  static async getPromptData(userId) {
    const [todaySessions, rooms, sessionCount] = await Promise.all([
      EnvRepo.findSessionsToday(),
      EnvRepo.findAllRooms(),
      EnvRepo.countSessionsTodayByInspector(userId),
    ]);
    return { todaySessions, rooms, sessionCount, limit: DAILY_LIMIT };
  }

  // ── Active session ─────────────────────────────────────────────────────────

  static async getActiveSession(userId) {
    return await EnvRepo.findActiveSessionByInspector(userId);
  }

  // ── Start session ──────────────────────────────────────────────────────────

  static async startSession(userId, roomId) {
    if (!roomId) throw new Error('กรุณาเลือกห้อง Server ที่จะตรวจก่อน');

    const existing = await EnvRepo.findActiveSessionByInspector(userId);
    if (existing) throw new Error('คุณมีรอบตรวจค้างอยู่แล้ว กรุณาทำรอบปัจจุบันให้เสร็จก่อน');

    const count = await EnvRepo.countSessionsTodayByInspector(userId);
    if (count >= DAILY_LIMIT) throw new Error(`ครบโควตาการตรวจวันนี้แล้ว (${DAILY_LIMIT} รอบ/วัน)`);

    const sessionId = await EnvRepo.createSession(roomId, userId, userId);
    return sessionId;
  }

  // ── Cancel session ─────────────────────────────────────────────────────────

  static async cancelSession(userId) {
    const session = await EnvRepo.findActiveSessionByInspector(userId);
    if (!session) throw new Error('ไม่พบรอบตรวจที่ค้างอยู่');
    await EnvRepo.cancelSession(session.id, userId);
  }

  // ── Reopen session ─────────────────────────────────────────────────────────

  static async reopenSession(sessionId, userId) {
    const session = await EnvRepo.findById(sessionId);
    if (!session) throw new Error('ไม่พบรอบตรวจ');
    if (session.status === 'in_progress') throw new Error('รอบนี้ยังอยู่ระหว่างดำเนินการ');
    const active = await EnvRepo.findActiveSessionByInspector(userId);
    if (active) throw new Error('คุณมีรอบตรวจค้างอยู่แล้ว กรุณาทำรอบปัจจุบันให้เสร็จก่อน');
    await EnvRepo.reopenSession(sessionId, userId);
  }

  // ── Get walk data (active session full detail) ─────────────────────────────

  static async getWalkData(userId) {
    const session = await EnvRepo.findActiveSessionByInspector(userId);
    if (!session) return null;

    const [racks, roomChecks, rackChecks, coolingLogs] = await Promise.all([
      EnvRepo.findRacksByRoom(session.room_id),
      EnvRepo.findRoomChecks(session.id),
      EnvRepo.findRackChecks(session.id),
      EnvRepo.findCoolingLogs(session.id),
    ]);

    return { session, racks, roomChecks, rackChecks, coolingLogs };
  }

  // ── Save room checklist ────────────────────────────────────────────────────

  static async saveRoomChecks(sessionId, userId, checksData) {
    const session = await EnvRepo.findById(sessionId);
    if (!session || session.status !== 'in_progress') throw new Error('ไม่พบรอบตรวจที่ active');

    const defs = EnvRepo.getRoomChecks();
    for (const def of defs) {
      const result = checksData[def.key] || 'na';
      const remark = checksData[`remark_${def.key}`] || null;
      await EnvRepo.upsertRoomCheck(sessionId, def.key, def.label, result, remark);
    }
  }

  // ── Save rack checklist ────────────────────────────────────────────────────

  static async saveRackChecks(sessionId, rackId, userId, checksData) {
    const session = await EnvRepo.findById(sessionId);
    if (!session || session.status !== 'in_progress') throw new Error('ไม่พบรอบตรวจที่ active');

    const defs = EnvRepo.getRackChecks();
    for (const def of defs) {
      const result = checksData[def.key] || 'na';
      const remark = checksData[`remark_${def.key}`] || null;
      await EnvRepo.upsertRackCheck(sessionId, rackId, def.key, def.label, result, remark);
    }
  }

  // ── Save cooling + complete session ───────────────────────────────────────

  static async completeSession(sessionId, userId, { temperatureC, humidityPct, notes, coolingItems }) {
    const session = await EnvRepo.findById(sessionId);
    if (!session || session.status !== 'in_progress') throw new Error('ไม่พบรอบตรวจที่ active');

    // Save cooling logs (replace all)
    await EnvRepo.deleteCoolingLogsBySession(sessionId);
    if (Array.isArray(coolingItems)) {
      for (const item of coolingItems) {
        if (!item.name || !item.name.trim()) continue;
        await EnvRepo.saveCoolingLog(
          sessionId,
          item.name.trim(),
          item.type || 'crac',
          item.status || 'normal',
          item.tempIn  || null,
          item.tempOut || null,
          item.remark  || null
        );
      }
    }

    // Determine overall status from all checks
    const [roomChecks, rackChecks, cooling] = await Promise.all([
      EnvRepo.findRoomChecks(sessionId),
      EnvRepo.findRackChecks(sessionId),
      EnvRepo.findCoolingLogs(sessionId),
    ]);

    const hasFail = roomChecks.some(c => c.result === 'fail') ||
                    rackChecks.some(c => c.result === 'fail') ||
                    cooling.some(c => c.status === 'fail');
    const hasWarning = roomChecks.some(c => c.result === 'fail' || c.result === 'na') ||
                       rackChecks.some(c => c.result === 'fail' || c.result === 'na') ||
                       cooling.some(c => c.status === 'warning');

    const overallStatus = hasFail ? 'fail' : hasWarning ? 'warning' : 'pass';

    await EnvRepo.completeSession(sessionId, overallStatus, temperatureC, humidityPct, notes, userId);
    return overallStatus;
  }

  // ── History page data ──────────────────────────────────────────────────────

  static async getHistoryData(query) {
    const page   = Math.max(1, parseInt(query.page) || 1);
    const limit  = 15;
    const offset = (page - 1) * limit;

    const filters = {
      startDate:     query.startDate     || null,
      endDate:       query.endDate       || null,
      roomId:        query.roomId        || null,
      inspectorId:   query.inspectorId   || null,
      overallStatus: query.overallStatus || null,
    };

    const [sessions, total, rooms, users] = await Promise.all([
      EnvRepo.findSessionsWithFilters({ ...filters, limit, offset }),
      EnvRepo.countSessionsWithFilters(filters),
      EnvRepo.findAllRooms(),
      EnvRepo.findAllUsers(),
    ]);

    return {
      sessions,
      filters,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
        hasPrev: page > 1,
        hasNext: page < Math.ceil(total / limit),
      },
      rooms,
      users,
    };
  }

  // ── Session detail ─────────────────────────────────────────────────────────

  static async getSessionDetail(sessionId) {
    const [session, roomChecks, rackChecks, coolingLogs] = await Promise.all([
      EnvRepo.findById(sessionId),
      EnvRepo.findRoomChecks(sessionId),
      EnvRepo.findRackChecks(sessionId),
      EnvRepo.findCoolingLogs(sessionId),
    ]);
    if (!session) return null;

    // Group rack checks by rack
    const rackMap = {};
    for (const c of rackChecks) {
      if (!rackMap[c.rack_id]) rackMap[c.rack_id] = { rack_name: c.rack_name, checks: [] };
      rackMap[c.rack_id].checks.push(c);
    }

    return { session, roomChecks, racksByChecks: Object.values(rackMap), coolingLogs };
  }

  // ── Dashboard summary ──────────────────────────────────────────────────────

  static async getDashboardSummary() {
    return await EnvRepo.getDashboardSummary();
  }

  // ── Static definitions (for views) ────────────────────────────────────────

  static getRoomCheckDefs() { return EnvRepo.getRoomChecks(); }
  static getRackCheckDefs() { return EnvRepo.getRackChecks(); }
}

module.exports = EnvInspectionService;
