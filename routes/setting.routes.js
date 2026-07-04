const express = require('express');
const router = express.Router();
const SettingController = require('../controllers/setting.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, SettingController.listSettings);
router.post('/', requireLogin, SettingController.createSetting);
router.post('/:id/update', requireLogin, SettingController.updateSetting);
router.post('/:id/delete', requireLogin, SettingController.deleteSetting);
router.get('/export', requireLogin, SettingController.exportSettings);
router.post('/import', requireLogin, upload.single('file'), SettingController.importSettings);
router.post('/notifications', requireLogin, SettingController.updateNotificationSettings);
router.post('/notifications/test', requireLogin, SettingController.testNotification);

module.exports = router;
