import { Router } from 'express';
const { getStatus, getStats } = require('../controllers/AppController.js')
const { postNew, getMe } = require('../controllers/UsersController.js');
const { getConnect, getDisconnect } = require('../controllers/AuthController.js');
const { postUpload, getFile, getIndex, putUnpublish, putPublish }  = require('../controllers/FilesController.js');
const router = Router('express');

router.get('/status', getStatus);
router.get('/stats', getStats);
router.post('/users', postNew);
router.get('/connect', getConnect);
router.get('/disconnect', getDisconnect);
router.get('/users/me', getMe);
router.post('/files', postUpload);
  router.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  });

  // should retrieve all users file documents for a
  // specific parentId and with pagination
  router.get('/files', (req, res) => {
    FilesController.getIndex(req, res);
  });

  // should set isPublic to true on the file document based on the ID
  router.put('/files/:id/publish', (req, res) => {
    FilesController.putPublish(req, res);
  });

  // should set isPublic to false on the file document based on the ID
  router.put('/files/:id/unpublish', (req, res) => {
    FilesController.putUnpublish(req, res);
  });

  // should return the content of the file document based on the ID
  router.get('/files/:id/data', (req, res) => {
    FilesController.getFile(req, res);
  });

module.exports = router;
