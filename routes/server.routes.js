const express = require('express');
const router = express.Router();
const ServerController = require('../controllers/server.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, ServerController.listServers);
router.post('/', requireLogin, ServerController.createServer);
router.post('/:id/update', requireLogin, ServerController.updateServer);
router.post('/:id/delete', requireLogin, ServerController.deleteServer);
router.get('/export', requireLogin, ServerController.exportServers);
router.post('/import', requireLogin, upload.single('file'), ServerController.importServers);

module.exports = router;
