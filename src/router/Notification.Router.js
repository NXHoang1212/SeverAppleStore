const router = require('express').Router();

const notificationController = require('../controller/Notification.Controller')


router.post('/create', notificationController.createNotification);

router.get('/get/:userId', notificationController.getNotifications);

router.delete('/delete/:notificationId', notificationController.deleteNotification);

module.exports = router;