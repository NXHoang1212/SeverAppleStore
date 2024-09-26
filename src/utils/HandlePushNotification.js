const { JWT } = require('google-auth-library');
const axios = require('axios');
const notificationService = require('../service/Notification.Service')

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

        if (!isValidToken(token)) {
            console.log(`Invalid token: ${token}`);
            continue; // Bỏ qua token không hợp lệ
        }

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
            await notificationService.createNotification({
                title: title,
                body: body,
                data: data,
            });
        } catch (error) {
            console.log('Error sending notification:', error);
        }
    }
}


module.exports = { sendNotification }