const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/role.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, RoleController.listRoles);
router.post('/', requireLogin, RoleController.createRole);
router.post('/:id/update', requireLogin, RoleController.updateRole);
router.post('/:id/delete', requireLogin, RoleController.deleteRole);
router.get('/export', requireLogin, RoleController.exportRoles);
router.post('/import', requireLogin, upload.single('file'), RoleController.importRoles);

module.exports = router;
