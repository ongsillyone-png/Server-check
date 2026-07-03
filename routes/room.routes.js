const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/room.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer(); // Defaults to Memory Storage for fast CSV buffer reading

router.get('/', requireLogin, RoomController.listRooms);
router.post('/', requireLogin, RoomController.createRoom);
router.post('/:id/update', requireLogin, RoomController.updateRoom);
router.post('/:id/delete', requireLogin, RoomController.deleteRoom);
router.get('/export', requireLogin, RoomController.exportRooms);
router.post('/import', requireLogin, upload.single('file'), RoomController.importRooms);

module.exports = router;
