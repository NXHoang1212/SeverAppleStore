const notificationModel = require('../model/Notification.Model')
const { JWT } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

// const getAccessToken = () => {
//     return new Promise(function (resolve, reject) {
//         const key = require('../json/service-account.json'); // Đường dẫn tới tệp JSON của bạn
//         const jwtClient = new JWT(
//             key.client_email,
//             null,
//             key.private_key,
//             SCOPES,
//             null
//         );
//         jwtClient.authorize(function (err, tokens) {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             resolve(tokens.access_token);
//         });
//     });
// }

class NotificationService {
    static async getAccessToken() {
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
}

module.exports = NotificationService;