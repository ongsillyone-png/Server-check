const InspectionService = require('../services/inspection.service');

class InspectionController {
  /**
   * Render walkthrough multi-step checklist screen
   * GET /inspections/walk
   */
  static async showWalkthrough(req, res, next) {
    try {
      const userId = req.session.user.id;
      const activeSession = await InspectionService.getActiveSession(userId);

      if (!activeSession) {
        // Render prompt to start session
        const { todaySessions, limit } = await InspectionService.getPromptData();
        return res.render('inspections/prompt', {
          title: 'เริ่มรอบการเดินตรวจ',
          currentPage: 'inspections',
          user: req.session.user,
          todaySessions,
          limit,
          error: req.query.error || null
        });
      }

      // Fetch Room progress list
      const rooms = await InspectionService.getRoomsWithStatus(activeSession.id);

      res.render('inspections/walk', {
        title: 'Walkthrough Inspect - Active Session',
        currentPage: 'inspections',
        user: req.session.user,
        session: activeSession,
        rooms
      });

    } catch (err) {
      next(err);
    }
  }

  /**
   * Start a new walking check tour session
   * POST /inspections/start
   */
  static async startSession(req, res, next) {
    try {
      const userId = req.session.user.id;
      await InspectionService.startSession(userId);
      res.redirect('/inspections/walk');
    } catch (err) {
      res.redirect(`/inspections/walk?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * Cancel walking session
   * POST /inspections/cancel
   */
  static async cancelSession(req, res, next) {
    try {
      const { sessionId } = req.body;
      const userId = req.session.user.id;
      await InspectionService.cancelSession(Number(sessionId), userId);
      res.redirect('/dashboard');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Finalize walking session
   * POST /inspections/complete
   */
  static async completeSession(req, res, next) {
    try {
      const { sessionId } = req.body;
      const userId = req.session.user.id;
      
      await InspectionService.completeSession(Number(sessionId), userId);
      res.redirect('/dashboard');
    } catch (err) {
      // If validation error (e.g. no servers inspected), redirect back with flash message or query param
      res.redirect(`/inspections/walk?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * Fetch racks inside room
   * GET /inspections/api/rooms/:id/racks
   */
  static async getRacksByRoom(req, res, next) {
    try {
      const { id } = req.params;
      const { sessionId } = req.query;
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const racks = await InspectionService.getRacksByRoomWithStatus(Number(sessionId), Number(id));
      res.json({ racks });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Fetch physical servers inside rack
   * GET /inspections/api/racks/:id/servers
   */
  static async getServersByRack(req, res, next) {
    try {
      const { id } = req.params;
      const { sessionId } = req.query;
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const servers = await InspectionService.getServersByRackWithStatus(Number(sessionId), Number(id));
      res.json({ servers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Fetch checklist layout for server
   * GET /inspections/api/servers/:id/checklist
   */
  static async getChecklist(req, res, next) {
    try {
      const { id } = req.params;
      const { sessionId } = req.query;
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const checklist = await InspectionService.getChecklistForServer(Number(sessionId), Number(id));
      res.json(checklist);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Save checklist answers for a specific server (with rollback)
   * POST /inspections/api/save-server
   */
  static async saveServer(req, res, next) {
    try {
      const sessionId = Number(req.body.sessionId);
      const serverId = Number(req.body.serverId);
      const remark = req.body.remark;
      const results = typeof req.body.results === 'string' ? JSON.parse(req.body.results) : req.body.results;
      const userId = req.session.user.id;

      if (!sessionId || !serverId || !Array.isArray(results)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Map uploaded files to checklist item IDs
      const filesMap = {};
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const match = file.fieldname.match(/^photo_(\d+)$/);
          if (match) {
            const itemId = Number(match[1]);
            filesMap[itemId] = '/uploads/inspections/' + file.filename;
          }
        });
      }

      const outcome = await InspectionService.saveServerInspection(
        sessionId,
        serverId,
        results,
        remark,
        userId,
        filesMap
      );

      res.json(outcome);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Reopen a completed session for update
   * POST /inspections/reopen
   */
  static async reopenSession(req, res, next) {
    try {
      const { sessionId } = req.body;
      const userId = req.session.user.id;
      
      if (!sessionId) {
        return res.status(400).send('Invalid session ID');
      }
      
      await InspectionService.reopenSession(Number(sessionId), userId);
      res.redirect('/inspections/walk');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render history list page
   * GET /inspections/history
   */
  static async showHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const type = req.query.type || 'physical'; // 'physical' or 'vm'

      const filters = {
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || '',
        roomId: req.query.roomId || '',
        rackId: req.query.rackId || '',
        serverId: req.query.serverId || '',
        inspectorId: req.query.inspectorId || ''
      };

      // Ensure VmInspectionService is required at the top, or require it here if not available globally in this file
      const VmInspectionService = require('../services/vm-inspection.service');

      let historyResult;
      if (type === 'vm') {
        historyResult = await VmInspectionService.getFilteredHistory(filters, page, limit);
      } else {
        historyResult = await InspectionService.getFilteredHistory(filters, page, limit);
      }

      const options = await InspectionService.getHistoryFilterOptions();

      res.render('inspection/history', {
        title: 'ประวัติและรายงานการเดินตรวจ - Server Check',
        currentPage: 'history',
        currentType: type, // Pass type to view for UI logic
        sessions: historyResult.sessions,
        pagination: historyResult.pagination,
        filters,
        rooms: options.rooms,
        racks: options.racks,
        servers: options.servers,
        users: options.users,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Render detailed report for a specific walking tour session
   * GET /inspections/history/:id
   */
  static async showHistoryDetail(req, res, next) {
    try {
      const sessionId = Number(req.params.id);
      const report = await InspectionService.getSessionReport(sessionId);

      if (!report) {
        return res.status(404).render('errors/404', {
          title: 'ไม่พบข้อมูล - Server Check',
          message: `ไม่พบประวัติการตรวจรอบที่ #${sessionId} ในระบบ`
        });
      }

      res.render('inspection/detail', {
        title: `รายงานการตรวจเช็ครอบที่ #${sessionId} - Server Check`,
        currentPage: 'history',
        session: report.session,
        rooms: report.rooms,
        user: req.session.user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Stream history results matching filters as CSV
   * GET /inspections/history/export
   */
  static async exportHistoryCSV(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || '',
        roomId: req.query.roomId || '',
        rackId: req.query.rackId || '',
        serverId: req.query.serverId || '',
        inspectorId: req.query.inspectorId || ''
      };

      const csvRows = await InspectionService.getHistoryCSVData(filters);

      const headers = [
        'รหัสรอบตรวจ', 'เวลาเริ่มตรวจ', 'เวลาเสร็จสิ้น', 'สถานะรอบตรวจ',
        'ผู้ตรวจสอบ', 'ห้องเซิร์ฟเวอร์', 'ตู้แร็ค', 'เครื่องเซิร์ฟเวอร์',
        'สถานะเซิร์ฟเวอร์', 'หมายเหตุเซิร์ฟเวอร์', 'รายการตรวจสอบ',
        'ผลตรวจสอบรายข้อ', 'ค่าที่กรอก/วัดได้', 'หมายเหตุรายข้อ'
      ];

      const csvLines = [];
      // Prepend BOM (\uFEFF) for Excel Thai character rendering
      csvLines.push('\uFEFF' + headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
      
      csvRows.forEach(row => {
        const line = headers.map(header => {
          const val = String(row[header] || '');
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',');
        csvLines.push(line);
      });

      const csvString = csvLines.join('\r\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=inspection_history_${Date.now()}.csv`);
      res.send(csvString);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InspectionController;
