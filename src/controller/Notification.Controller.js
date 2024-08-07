const notificationService = require('../service/Notification.Service')

class NotificationController {
    static async getNotifications(req, res) {
        try {
            const { userId } = req.params;
            const notifications = await notificationService.getNotifications(userId);
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

    static async updateNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const notification = await notificationService.updateNotification(notificationId);
            return res.status(200).json({
                status: 200,
                message: 'Successfully updated notification',
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

    static async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const notification = await notificationService.deleteNotification(notificationId);
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