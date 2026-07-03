const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/template.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, TemplateController.listTemplates);
router.post('/', requireLogin, TemplateController.createTemplate);
router.post('/:id/update', requireLogin, TemplateController.updateTemplate);
router.post('/:id/delete', requireLogin, TemplateController.deleteTemplate);
router.get('/export', requireLogin, TemplateController.exportTemplates);
router.post('/import', requireLogin, upload.single('file'), TemplateController.importTemplates);

module.exports = router;
