const express = require('express');
const router = express.Router();
const AssetTypeController = require('../controllers/asset-type.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, AssetTypeController.listAssetTypes);
router.post('/', requireLogin, AssetTypeController.createAssetType);
router.post('/:id/update', requireLogin, AssetTypeController.updateAssetType);
router.post('/:id/delete', requireLogin, AssetTypeController.deleteAssetType);
router.get('/export', requireLogin, AssetTypeController.exportAssetTypes);
router.post('/import', requireLogin, upload.single('file'), AssetTypeController.importAssetTypes);

module.exports = router;
