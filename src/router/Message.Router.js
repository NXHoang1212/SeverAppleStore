const Router = require('express').Router();
const { uploadMulterSingle } = require('../middleware/UploadFormAws');
const messageController = require('../controller/Message.Controller')


Router.post('/upload', uploadMulterSingle, messageController.uploadMessage);



module.exports = Router;