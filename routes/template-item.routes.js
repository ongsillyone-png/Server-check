const express = require('express');
const router = express.Router();
const TemplateItemController = require('../controllers/template-item.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, TemplateItemController.listTemplateItems);
router.post('/', requireLogin, TemplateItemController.createTemplateItem);
router.post('/:id/update', requireLogin, TemplateItemController.updateTemplateItem);
router.post('/:id/delete', requireLogin, TemplateItemController.deleteTemplateItem);
router.get('/export', requireLogin, TemplateItemController.exportTemplateItems);
router.post('/import', requireLogin, upload.single('file'), TemplateItemController.importTemplateItems);

module.exports = router;
