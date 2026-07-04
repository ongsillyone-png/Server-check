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
      const { sessionId, serverId, remark, results } = req.body;
      const userId = req.session.user.id;

      if (!sessionId || !serverId || !Array.isArray(results)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      const outcome = await InspectionService.saveServerInspection(
        Number(sessionId),
        Number(serverId),
        results,
        remark,
        userId
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
}

module.exports = InspectionController;
