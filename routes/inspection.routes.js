const express = require('express');
const router = express.Router();
const InspectionController = require('../controllers/inspection.controller');
const VmInspectionController = require('../controllers/vm-inspection.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

// ─── Physical Server Inspection Routes (เดิม — ไม่แตะ) ───────────────────────
router.get('/walk', requireLogin, InspectionController.showWalkthrough);
router.post('/start', requireLogin, InspectionController.startSession);
router.post('/cancel', requireLogin, InspectionController.cancelSession);
router.post('/complete', requireLogin, InspectionController.completeSession);
router.post('/reopen', requireLogin, InspectionController.reopenSession);
router.get('/history', requireLogin, InspectionController.showHistory);
router.get('/history/export', requireLogin, InspectionController.exportHistoryCSV);
router.get('/history/:id', requireLogin, InspectionController.showHistoryDetail);

const upload = require('../middlewares/upload.middleware');

// Physical Server API routes (เดิม — ไม่แตะ)
router.get('/api/rooms/:id/racks', requireLogin, InspectionController.getRacksByRoom);
router.get('/api/racks/:id/servers', requireLogin, InspectionController.getServersByRack);
router.get('/api/servers/:id/checklist', requireLogin, InspectionController.getChecklist);
router.post('/api/save-server', requireLogin, upload.any(), InspectionController.saveServer);

// ─── VM Inspection Routes (ใหม่) ──────────────────────────────────────────────
router.get('/vm-walk', requireLogin, VmInspectionController.showWalkthrough);
router.post('/vm-start', requireLogin, VmInspectionController.startSession);
router.post('/vm-cancel', requireLogin, VmInspectionController.cancelSession);
router.post('/vm-complete', requireLogin, VmInspectionController.completeSession);
router.post('/vm-reopen', requireLogin, VmInspectionController.reopenSession);

// VM Inspection API routes
router.get('/vm-api/hosts/:id/vms', requireLogin, VmInspectionController.getVmsByHost);
router.get('/vm-api/vms/:id/checklist', requireLogin, VmInspectionController.getChecklist);
router.post('/vm-api/save-vm', requireLogin, upload.any(), VmInspectionController.saveVm);

module.exports = router;

