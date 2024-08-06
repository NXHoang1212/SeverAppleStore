const notificationModel = require('../model/Notification.Model')

class NotificationService {
    static async createNotification(notificationData) {
        try {
            const newNotification = new notificationModel(notificationData);
            const result = await newNotification.save();
            return {
                status: 201,
                message: 'Notification created successfully',
                data: result
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getNotifications(userId) {
        try {
            const notifications = await notificationModel.findOne({ userId: userId });
            if (!notifications) {
                return {
                    status: 200,
                    message: 'Notifications retrieved successfully',
                    data: []
                }
            }
            return {
                status: 200,
                message: 'Notifications retrieved successfully',
                data: notifications
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async updateNotification(notificationId) {
        try {
            const notification = await notificationModel.findByIdAndUpdate
                (notificationId, { isRead: true }, { new: true });
            if (!notification) {
                return {
                    status: 404,
                    message: 'Notification not found',
                    data: null
                }
            }
            return {
                status: 200,
                message: 'Notification updated successfully',
                data: notification
            }
        }
        catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async deleteNotification(notificationId) {
        try {
            const notification = await notificationModel.findByIdAndDelete(notificationId);
            if (!notification) {
                return {
                    status: 404,
                    message: 'Notification not found',
                    data: null
                }
            }
            return {
                status: 200,
                message: 'Notification deleted successfully',
                data: notification
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }
}

module.exports = NotificationService;