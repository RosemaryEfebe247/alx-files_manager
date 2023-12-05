import { Router } from 'express';
const { getStatus, getStats } = require('../controllers/AppController.js')
const { postNew, getMe } = require('../controllers/UsersController.js');
const { getConnect, getDisconnect } = require('../controllers/AuthController.js');
const router = Router('express');

router.get('/status', getStatus);
router.get('/stats', getStats);
router.post('/users', postNew);
router.get('/connect', getConnect);
router.get('/disconnect', getDisconnect);
router.get('/users/me', getMe);

module.exports = router;
