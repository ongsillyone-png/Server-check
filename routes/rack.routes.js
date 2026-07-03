const express = require('express');
const router = express.Router();
const RackController = require('../controllers/rack.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, RackController.listRacks);
router.post('/', requireLogin, RackController.createRack);
router.post('/:id/update', requireLogin, RackController.updateRack);
router.post('/:id/delete', requireLogin, RackController.deleteRack);
router.get('/export', requireLogin, RackController.exportRacks);
router.post('/import', requireLogin, upload.single('file'), RackController.importRacks);

module.exports = router;
