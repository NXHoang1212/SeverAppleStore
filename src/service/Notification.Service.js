const notificationModel = require('../model/Notification.Model')
const userModel = require('../model/Auth.Model')
const { JWT } = require('google-auth-library');
const axios = require('axios');
const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

const getAccessToken = () => {
    return new Promise(function (resolve, reject) {
        const key = require('../../json/service-account.json');
        const jwtClient = new JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}

const sendNotification = async (fcmTokens, title, body, data) => {
    let tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
    for (let token of tokens) {
        let payload = {
            message: {
                token: token,
                notification: {
                    title: title,
                    body: body
                },
                data: data
            }
        };
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://fcm.googleapis.com/v1/projects/signin-e878e/messages:send',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAccessToken()}`
            },
            data: JSON.stringify(payload)
        };

        try {
            const response = await axios.request(config);
            console.log('Sent notification:', JSON.stringify(response.data));
        } catch (error) {
            console.log('Error sending notification:', error);
        }
    }
}

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

    static async createAdminNotification(notificationData) {
        try {
            const newNotification = new notificationModel(notificationData);
            newNotification.isAdmin = true;
            const result = await newNotification.save();
            //tìm id thông báo sau đó gưi thông báo
            const user = await userModel.findById(notificationData.data.userId);
            //send notification
            if (user.fcmToken) {
                await sendNotification(user.fcmToken, notificationData.title, notificationData.body, notificationData.data);
            }
            return {
                status: 201,
                message: 'Notification created successfully',
                data: result
            }
        } catch (error) {
            console.log("🚀 ~ NotificationService ~ createAdminNotification ~ error:", error)
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getNotifications(data) {
        try {
            const notifications = await notificationModel.find({ 'data.userId': data }).populate('data.userId').populate('data.orderId');

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

    // Cập nhật nhiều thông báo đã đọc
    static async updateNotificationUser(data) {
        try {
            // Tìm các thông báo chưa đọc
            const unreadNotifications = await notificationModel.find({
                'data.userId': data.userId,
                isRead: false
            });

            // Nếu không có thông báo nào chưa đọc, trả về kết quả
            if (unreadNotifications.length === 0) {
                return {
                    status: 200,
                    message: 'All notifications are already read',
                    data: null
                };
            }

            // Cập nhật những thông báo chưa đọc thành đã đọc
            const result = await notificationModel.updateMany(
                { 'data.userId': data.userId, isRead: false },
                { isRead: true }
            );

            return {
                status: 200,
                message: 'Unread notifications updated successfully',
                data: result
            };
        } catch (error) {
            console.log("🚀 ~ NotificationService ~ updateNotificationUser ~ error:", error)
            return {
                status: 500,
                message: error.message,
                data: null
            };
        }
    }

    static async deleteNotificationUser(id) {
        try {
            const notification = await notificationModel.findById(id);
            if (!notification) {
                return {
                    status: 404,
                    message: 'Notification not found',
                    data: null
                }
            }
            const result = await notificationModel.findByIdAndDelete(id);
            return {
                status: 200,
                message: 'Notification deleted successfully',
                data: result
            }
        } catch (error) {
            console.log("🚀 ~ NotificationService ~ deleteNotificationUser ~ error:", error)
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

    static async getAdminNotifications() {
        try {
            const notifications = await notificationModel.find({ isAdmin: true });
            return {
                status: 200,
                message: 'Notifications retrieved successfully',
                data: notifications
            }
        } catch (error) {
            console.log("🚀 ~ NotificationService ~ getAdminNotifications ~ error:", error)
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }
}

module.exports = NotificationService;