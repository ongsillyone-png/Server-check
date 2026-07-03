const express = require('express');
const router = express.Router();
const InspectionController = require('../controllers/inspection.controller');
const { requireLogin } = require('../middlewares/auth.middleware');

router.get('/walk', requireLogin, InspectionController.showWalkthrough);
router.get('/history', requireLogin, InspectionController.showHistory);
router.get('/:id', requireLogin, InspectionController.showInspectionDetail);

module.exports = router;
