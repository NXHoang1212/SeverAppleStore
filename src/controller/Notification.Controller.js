const notificationService = require('../service/Notification.Service')

class NotificationController {
    static async createNotification(req, res) {
        try {
            const notificationData = req.body;
            const notification = await notificationService.createAdminNotification(notificationData);
            return res.status(201).json({
                status: 201,
                message: 'Notification created successfully',
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
            const { userId } = req.params;
            const notifications = await notificationService.getNotifications(userId);
            return res.status(notifications.status).json(notifications);
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async updateNotificationUser(req, res) {
        try {   
            const notification = await notificationService.updateNotificationUser(req.body);
            return res.status(notification.status).json(notification);
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async deleteNotificationUser(req, res) {
        try {
            const notification = await notificationService.deleteNotificationUser(req.params.id);
            return res.status(notification.status).json(notification);
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

    static async getAdminNotifications(req, res) {
        try {
            const notifications = await notificationService.getAdminNotifications();
            return res.status(200).json({
                status: 200,
                message: 'Successfully retrieved notifications',
                data: notifications.data,
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