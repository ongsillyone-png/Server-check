const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { requireLogin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', requireLogin, UserController.listUsers);
router.post('/', requireLogin, UserController.createUser);
router.post('/:id/update', requireLogin, UserController.updateUser);
router.post('/:id/delete', requireLogin, UserController.deleteUser);
router.get('/export', requireLogin, UserController.exportUsers);
router.post('/import', requireLogin, upload.single('file'), UserController.importUsers);

module.exports = router;
