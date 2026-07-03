const express = require('express');
const router = express.Router();
const VmController = require('../controllers/vm.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, VmController.listVms);
router.post('/', requireLogin, VmController.createVm);
router.post('/:id/update', requireLogin, VmController.updateVm);
router.post('/:id/delete', requireLogin, VmController.deleteVm);
router.get('/export', requireLogin, VmController.exportVms);
router.post('/import', requireLogin, upload.single('file'), VmController.importVms);

module.exports = router;
