const VmInspectionService = require('../services/vm-inspection.service');

class VmInspectionController {
  /**
   * GET /inspections/vm-walk
   * Render VM walkthrough page or prompt if no active session
   */
  static async showWalkthrough(req, res, next) {
    try {
      const userId = req.session.user.id;
      const activeSession = await VmInspectionService.getActiveSession(userId);

      if (!activeSession) {
        const { todaySessions, limit } = await VmInspectionService.getPromptData();
        return res.render('inspections/vm-prompt', {
          title: 'เริ่มรอบตรวจ VM - Server Check',
          currentPage: 'vm-inspections',
          user: req.session.user,
          todaySessions,
          limit,
          error: req.query.error || null
        });
      }

      // โหลด hosts ที่มี VM พร้อมสถานะ
      const hosts = await VmInspectionService.getHostsWithVmStatus(activeSession.id);

      res.render('inspections/vm-walk', {
        title: 'ตรวจสอบ VM - Active Session',
        currentPage: 'vm-inspections',
        user: req.session.user,
        session: activeSession,
        hosts
      });

    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /inspections/vm-start
   * Start a new VM inspection session
   */
  static async startSession(req, res, next) {
    try {
      const userId = req.session.user.id;
      await VmInspectionService.startSession(userId);
      res.redirect('/inspections/vm-walk');
    } catch (err) {
      res.redirect(`/inspections/vm-walk?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * POST /inspections/vm-cancel
   * Cancel active VM session
   */
  static async cancelSession(req, res, next) {
    try {
      const { sessionId } = req.body;
      const userId = req.session.user.id;
      await VmInspectionService.cancelSession(Number(sessionId), userId);
      res.redirect('/dashboard');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /inspections/vm-complete
   * Complete VM inspection session
   */
  static async completeSession(req, res, next) {
    try {
      const { sessionId } = req.body;
      const userId = req.session.user.id;
      await VmInspectionService.completeSession(Number(sessionId), userId);
      res.redirect('/dashboard');
    } catch (err) {
      res.redirect(`/inspections/vm-walk?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * POST /inspections/vm-reopen
   * Reopen a completed VM session
   */
  static async reopenSession(req, res, next) {
    try {
      const { sessionId } = req.body;
      const userId = req.session.user.id;
      if (!sessionId) return res.status(400).send('Invalid session ID');
      await VmInspectionService.reopenSession(Number(sessionId), userId);
      res.redirect('/inspections/vm-walk');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /inspections/vm-api/hosts/:id/vms
   * Fetch VMs for a specific host with inspection status
   */
  static async getVmsByHost(req, res, next) {
    try {
      const { id } = req.params;
      const { sessionId } = req.query;
      if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

      const vms = await VmInspectionService.getVmsByHostWithStatus(Number(sessionId), Number(id));
      res.json({ vms });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /inspections/vm-api/vms/:id/checklist
   * Fetch checklist template items + previous results for a VM
   */
  static async getChecklist(req, res, next) {
    try {
      const { id } = req.params;
      const { sessionId } = req.query;
      if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

      const checklist = await VmInspectionService.getChecklistForVm(Number(sessionId), Number(id));
      res.json(checklist);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /inspections/vm-api/save-vm
   * Save checklist answers for a VM
   */
  static async saveVm(req, res, next) {
    try {
      const sessionId = Number(req.body.sessionId);
      const vmId = Number(req.body.vmId);
      const remark = req.body.remark || '';
      // Parse results — ส่งมาเป็น JSON string ใน FormData
      const results = typeof req.body.results === 'string'
        ? JSON.parse(req.body.results)
        : (Array.isArray(req.body.results) ? req.body.results : []);
      const userId = req.session.user.id;

      if (!sessionId || !vmId || !Array.isArray(results)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      const outcome = await VmInspectionService.saveVmInspection(sessionId, vmId, results, remark, userId);
      res.json(outcome);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = VmInspectionController;
