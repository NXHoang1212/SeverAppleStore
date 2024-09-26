const router = require('express').Router();

const notificationController = require('../controller/Notification.Controller')

router.get('/get/:userId', notificationController.getNotifications);

router.put('/updateIsRead', notificationController.updateNotificationUser);

router.delete('/delete/:id', notificationController.deleteNotificationUser);

router.put('/admin/update/:notificationId', notificationController.updateNotification);

router.post('/admin/createNotifications', notificationController.createNotification);

router.delete('/admin/delete/:notificationId', notificationController.deleteNotification);

router.get('/admin/getNotification', notificationController.getAdminNotifications);

module.exports = router;
