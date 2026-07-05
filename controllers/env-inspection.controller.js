const EnvInspectionService = require('../services/env-inspection.service');

class EnvInspectionController {

  // ── GET /env-inspections/walk ──────────────────────────────────────────────
  static async showWalkthrough(req, res, next) {
    try {
      const userId = req.session.user.id;
      const activeData = await EnvInspectionService.getWalkData(userId);

      if (!activeData) {
        // No active session → show prompt
        const { todaySessions, rooms, sessionCount, limit } = await EnvInspectionService.getPromptData(userId);
        return res.render('env-inspection/prompt', {
          title: 'ตรวจสภาพแวดล้อมห้อง Server',
          currentPage: 'env-inspections',
          user: req.session.user,
          todaySessions,
          rooms,
          sessionCount,
          limit,
          error: req.query.error || null,
        });
      }

      res.render('env-inspection/walk', {
        title: 'ตรวจสภาพแวดล้อม — กำลังดำเนินการ',
        currentPage: 'env-inspections',
        user: req.session.user,
        ...activeData,
        roomCheckDefs: EnvInspectionService.getRoomCheckDefs(),
        rackCheckDefs: EnvInspectionService.getRackCheckDefs(),
        error: req.query.error || null,
      });
    } catch (err) { next(err); }
  }

  // ── POST /env-inspections/start ────────────────────────────────────────────
  static async startSession(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { roomId } = req.body;
      await EnvInspectionService.startSession(userId, roomId);
      res.redirect('/env-inspections/walk');
    } catch (err) {
      res.redirect(`/env-inspections/walk?error=${encodeURIComponent(err.message)}`);
    }
  }

  // ── POST /env-inspections/cancel ───────────────────────────────────────────
  static async cancelSession(req, res, next) {
    try {
      const userId = req.session.user.id;
      await EnvInspectionService.cancelSession(userId);
      res.redirect('/env-inspections/walk');
    } catch (err) {
      res.redirect(`/env-inspections/walk?error=${encodeURIComponent(err.message)}`);
    }
  }

  // ── POST /env-inspections/reopen ───────────────────────────────────────────
  static async reopenSession(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { sessionId } = req.body;
      await EnvInspectionService.reopenSession(Number(sessionId), userId);
      res.redirect('/env-inspections/walk');
    } catch (err) {
      res.redirect(`/env-inspections/walk?error=${encodeURIComponent(err.message)}`);
    }
  }

  // ── POST /env-inspections/api/save-room ────────────────────────────────────
  static async saveRoomChecks(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { sessionId, ...checksData } = req.body;
      await EnvInspectionService.saveRoomChecks(Number(sessionId), userId, checksData);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // ── POST /env-inspections/api/save-rack ────────────────────────────────────
  static async saveRackChecks(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { sessionId, rackId, ...checksData } = req.body;
      await EnvInspectionService.saveRackChecks(Number(sessionId), Number(rackId), userId, checksData);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // ── POST /env-inspections/complete ─────────────────────────────────────────
  static async completeSession(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { sessionId, temperatureC, humidityPct, notes, coolingItems } = req.body;

      const parsedCooling = typeof coolingItems === 'string'
        ? JSON.parse(coolingItems)
        : (coolingItems || []);

      await EnvInspectionService.completeSession(Number(sessionId), userId, {
        temperatureC: temperatureC ? parseFloat(temperatureC) : null,
        humidityPct:  humidityPct  ? parseFloat(humidityPct)  : null,
        notes:        notes        || null,
        coolingItems: parsedCooling,
      });
      res.redirect('/env-inspections/walk');
    } catch (err) {
      res.redirect(`/env-inspections/walk?error=${encodeURIComponent(err.message)}`);
    }
  }

  // ── GET /env-inspections/history ───────────────────────────────────────────
  static async showHistory(req, res, next) {
    try {
      const data = await EnvInspectionService.getHistoryData(req.query);
      res.render('env-inspection/history', {
        title: 'ประวัติการตรวจสภาพแวดล้อม',
        currentPage: 'env-inspections',
        user: req.session.user,
        ...data,
      });
    } catch (err) { next(err); }
  }

  // ── GET /env-inspections/history/:id ──────────────────────────────────────
  static async showHistoryDetail(req, res, next) {
    try {
      const detail = await EnvInspectionService.getSessionDetail(Number(req.params.id));
      if (!detail) return res.status(404).render('errors/404', { user: req.session.user });
      res.render('env-inspection/detail', {
        title: `รายละเอียดรอบตรวจ #${req.params.id}`,
        currentPage: 'env-inspections',
        user: req.session.user,
        ...detail,
      });
    } catch (err) { next(err); }
  }
}

module.exports = EnvInspectionController;
