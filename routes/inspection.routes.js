const express = require('express');
const router = express.Router();
const InspectionController = require('../controllers/inspection.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

// Page routes
router.get('/walk', requireLogin, InspectionController.showWalkthrough);
router.post('/start', requireLogin, InspectionController.startSession);
router.post('/cancel', requireLogin, InspectionController.cancelSession);
router.post('/complete', requireLogin, InspectionController.completeSession);
router.post('/reopen', requireLogin, InspectionController.reopenSession);

// API routes
router.get('/api/rooms/:id/racks', requireLogin, InspectionController.getRacksByRoom);
router.get('/api/racks/:id/servers', requireLogin, InspectionController.getServersByRack);
router.get('/api/servers/:id/checklist', requireLogin, InspectionController.getChecklist);
router.post('/api/save-server', requireLogin, InspectionController.saveServer);

module.exports = router;
