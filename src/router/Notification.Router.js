const router = require('express').Router();

const notificationController = require('../controller/Notification.Controller')

router.get('/get/:userId', notificationController.getNotifications);

router.put('/update/:notificationId', notificationController.updateNotification);

router.delete('/delete/:notificationId', notificationController.deleteNotification);

module.exports = router;