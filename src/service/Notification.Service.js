const notificationModel = require('../model/Notification.Model')

class NotificationService {
    static async createNotification(notificationData) {
        try {
            let notification = await notificationModel.create(notificationData);
            return notification;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    static async getNotifications(userId) {
        try {
            let notifications = await notificationModel.find({ userId: userId });
            return notifications;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    static async deleteNotification(notificationId) {
        try {
            let notification = await notificationModel.findByIdAndDelete(notificationId);
            return notification;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = NotificationService;