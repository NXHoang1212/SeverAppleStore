const Router = require('express').Router();
const AuthController = require('../controller/Auth.Controller');
const { uploadAvatar } = require('../middleware/UploadFormAws');

Router.post('/register', AuthController.register);

Router.post('/login', AuthController.login);

Router.post('/loginProvider', AuthController.loginProvider);

Router.get('/user/:id', AuthController.getUserById);

Router.put('/updateUser/:id', AuthController.updateUser);

Router.delete('/deleteUser/:id', AuthController.deleteUser);

Router.put('/resetPassword/:id', AuthController.resetPassword);

Router.put('/authenticatePassword/:id', AuthController.authenticatePassword);

Router.post('/sendMail', AuthController.sendMailPassword);

Router.post('/verifyMailOtp', AuthController.verifyMailOtp);

Router.post('/resetPasswordFromMail', AuthController.resetPasswordFromMail);

Router.put('/uploadAvatar/:id', uploadAvatar, AuthController.uploadAvatar);

Router.put('/updateFcmToken/:id', AuthController.updateFcmToken);

Router.put('/removeFcmToken/:id', AuthController.removeFcmToken);

Router.get('/admin/getAllUsers', AuthController.getAllUser);

module.exports = Router;