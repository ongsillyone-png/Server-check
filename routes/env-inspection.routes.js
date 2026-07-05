const express = require('express');
const router = express.Router();
const EnvInspectionController = require('../controllers/env-inspection.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

// ── Walkthrough & Session management ──────────────────────────────────────────
router.get('/walk',     requireLogin, EnvInspectionController.showWalkthrough);
router.post('/start',   requireLogin, EnvInspectionController.startSession);
router.post('/cancel',  requireLogin, EnvInspectionController.cancelSession);
router.post('/reopen',  requireLogin, EnvInspectionController.reopenSession);
router.post('/complete',requireLogin, EnvInspectionController.completeSession);

// ── History ────────────────────────────────────────────────────────────────────
router.get('/history',     requireLogin, EnvInspectionController.showHistory);
router.get('/history/:id', requireLogin, EnvInspectionController.showHistoryDetail);

// ── AJAX / API endpoints ───────────────────────────────────────────────────────
router.post('/api/save-room', requireLogin, EnvInspectionController.saveRoomChecks);
router.post('/api/save-rack', requireLogin, EnvInspectionController.saveRackChecks);

module.exports = router;
