const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.get('/login', AuthController.showLogin);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

module.exports = router;
