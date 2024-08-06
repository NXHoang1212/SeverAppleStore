const notificationService = require('../service/Notification.Service')

class NotificationController {
    static async createNotification(req, res) {
        try {
            let notificationData = {
                title: req.body.title,
                body: req.body.body,
                data: req.body.data,
                userId: req.body.userId,
            };
            let notification = await notificationService.createNotification(notificationData);
            return res.status(200).json({
                status: 200,
                message: 'Successfully created notification',
                data: notification,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getNotifications(req, res) {
        try {
            let userId = req.params.userId;
            let notifications = await notificationService.getNotifications(userId);
            return res.status(200).json({
                status: 200,
                message: 'Successfully retrieved notifications',
                data: notifications,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async deleteNotification(req, res) {
        try {
            let notificationId = req.params.notificationId;
            let notification = await notificationService.deleteNotification(notificationId);
            return res.status(200).json({
                status: 200,
                message: 'Successfully deleted notification',
                data: notification,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }
}

module.exports = NotificationController;