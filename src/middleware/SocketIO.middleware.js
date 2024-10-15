const { Server } = require('socket.io');
const moment = require('moment');
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

const getVietnamTime = () => {
    return moment().utcOffset('+0700').format('HH:mm');
};

const socketServer = (socketPort) => {
    const io = new Server(socketPort, {
        cors: {
            origin: 'http://localhost:5000',
            methods: ['GET', 'POST'],
        },
    });

    const users = {};
    const waitingUsers = {};
    let adminFcmTokens = {}; // lưu theo id của admin
    let userFcmTokens = {};  // lưu theo id của user

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('joinRoom', ({ username, room, role }) => {
            users[socket.id] = username;
            socket.join(room);
            if (waitingUsers[room]) {
                socket.emit('loadMessages', waitingUsers[room].messages);
            } else {
                waitingUsers[room] = { messages: [], hasWelcomed: false };
            }
            if (role === 'user' && !waitingUsers[room].hasWelcomed) {
                const welcomeMessage = {
                    username: 'Admin',
                    message: 'Xin chào, bạn cần hỗ trợ gì ạ?',
                    time: getVietnamTime(),
                    isRead: true,
                };
                waitingUsers[room].messages.push(welcomeMessage);
                socket.emit('userMessage', welcomeMessage);
                waitingUsers[room].hasWelcomed = true;
            }
        });

        // Xử lý khi người dùng gửi hình ảnh
        socket.on('sendImage', async ({ image, room, username, role, message, userId }) => {
            const currentTime = getVietnamTime();
            // Lưu tin nhắn hình ảnh vào waitingUsers
            if (!waitingUsers[room]) {
                waitingUsers[room] = { messages: [] };
            }
            const imageMessage = {
                username,
                time: currentTime,
                room,
                message,
                isRead: true,
                role,
                image
            };
            waitingUsers[room].messages.push(imageMessage);
            // Phát lại cho tất cả người dùng trong phòng
            io.emit('newMessageFromUser', { username, message, time: currentTime, room, isRead: false, role, userId });
            io.to(room).emit('userImage', { image, username, time: currentTime, room, isRead: true, role, message, userId });

            //xử lý thông báo nếu user hoặc admin gửi ảnh
            const token = role === 'admin' ? userFcmTokens[userId] : Object.values(adminFcmTokens);
            console.log("🚀 ~ socket.on ~ token:", token)
            if (token) {
                const type = 'image';
                const title = `Ảnh mới từ ${username}`;
                const body = message;
                const data = { type, username, message, time: currentTime, room, role, userId };

                await sendNotification(token, title, body, data);
            } else {
                console.log("No FCM token found for user:", userId);
            }
        });

        //xử lý khi người dùng gửi file âm thanh 
        socket.on('sendAudioMessage', async ({ audio, room, username, role, message }) => {
            const currentTime = getVietnamTime();
            // Lưu tin nhắn hình ảnh vào waitingUsers
            if (!waitingUsers[room]) {
                waitingUsers[room] = { messages: [] };
            }
            const audioMessage = {
                username,
                time: currentTime,
                room,
                message,
                isRead: true,
                role,
                audio
            };
            waitingUsers[room].messages.push(audioMessage);
            // Phát lại cho tất cả người dùng trong phòng
            io.emit('newMessageFromUser', { username, message, time: currentTime, room, isRead: false, role });
            io.to(room).emit('userAudio', { audio, username, time: currentTime, room, isRead: true, role, message });
        });

        //xử lý khi người dùng gửi file video
        socket.on('sendVideoMessage', ({ video, room, username, role, message }) => {
            const currentTime = getVietnamTime();
            // Lưu tin nhắn hình ảnh vào waitingUsers
            if (!waitingUsers[room]) {
                waitingUsers[room] = { messages: [] };
            }
            const videoMessage = {
                username,
                time: currentTime,
                room,
                message,
                isRead: true,
                role,
                video
            };
            waitingUsers[room].messages.push(videoMessage);
            // Phát lại cho tất cả người dùng trong phòng
            io.emit('newMessageFromUser', { username, message, time: currentTime, room, isRead: false, role });
            io.to(room).emit('userVideo', { video, username, time: currentTime, room, isRead: true, role, message });
        })

        socket.on('registerFcmToken', ({ fcmToken, role, id }) => {
            if (role === 'admin') {
                adminFcmTokens[id] = fcmToken;
                console.log("🚀 ~ socket.on ~ adminFcmTokens:", adminFcmTokens)
            } else if (role === 'user') {
                userFcmTokens[id] = fcmToken;
                console.log("🚀 ~ socket.on ~ userFcmTokens:", userFcmTokens)
            }
        });


        // Xử lý khi người dùng gửi tin nhắn
        socket.on('sendMessage', async ({ username, message, room, role, userId }) => {
            const currentTime = getVietnamTime();
            if (!waitingUsers[room]) {
                waitingUsers[room] = { messages: [], username };
            }
            waitingUsers[room].messages.push({ username, message, time: currentTime, isRead: true, room, role, userId });
            io.emit('newMessageFromUser', { username, message, time: currentTime, room, isRead: false, role, userId });
            io.to(room).emit('userMessage', { username, message, time: currentTime, room, isRead: true, role, userId });

            // Gửi thông báo đến admin
            const token = Object.values(adminFcmTokens);
            console.log("🚀 ~ socket.on ~ token:", token)
            if (token) {
                const type = 'messageAdmin';
                const title = `Tin nhắn mới từ ${username}`;
                const body = message;
                const data = { type, username, message, time: currentTime, room, role, userId };

                console.log("🚀 ~ socket.on ~ fcmTokens:", token);
                await sendNotification(token, title, body, data);
            } else {
                console.log("No admin FCM token found.");
            }
        });

        // Xử lý yêu cầu lấy lại tin nhắn chờ từ admin
        socket.on('getWaitingMessages', () => {
            Object.keys(waitingUsers).forEach((room) => {
                waitingUsers[room].messages.forEach((waitingMessage) => {
                    if (!(waitingMessage.username === 'Admin' && waitingMessage.message.includes('Xin chào'))) {
                        const messageData = {
                            username: waitingMessage.username,  // Thêm username vào dữ liệu gửi
                            message: waitingMessage.message,
                            time: waitingMessage.time,
                            room: room,
                            isRead: waitingMessage.isRead,
                            role: waitingMessage.role,
                            userId: waitingMessage.userId,
                        };
                        socket.emit('newMessageFromUser', messageData);
                    }
                });
            });
        });

        // Xử lý khi admin gửi tin nhắn
        socket.on('adminMessage', async ({ room, message, role, userId }) => {
            const currentTime = getVietnamTime();
            if (!waitingUsers[room]) {
                waitingUsers[room] = { messages: [] };
            }
            const adminMessage = { username: 'Admin', message, time: currentTime, room, isRead: true, role, };
            waitingUsers[room].messages.push(adminMessage);
            io.to(room).emit('userMessage', adminMessage);

            // Gửi thông báo đến user cụ thể
            const token = userFcmTokens[userId];  // Lấy token của user từ danh sách
            console.log("🚀 ~ socket.on ~ token:", token);

            if (token) {
                const type = 'messageUser'
                const title = 'Admin gửi tin nhắn mới';
                const body = message;
                const data = { type, username: 'Admin', message, time: currentTime, room, role };

                await sendNotification(token, title, body, data);
            } else {
                console.log("No FCM token found for user:", userId);
            }
        });

        // Xử lý khi admin tham gia phòng chat của user
        socket.on('joinUserRoom', ({ admin, user }) => {
            const room = user;
            socket.join(room); // Admin tham gia phòng chat của user
            if (waitingUsers[user]) {
                waitingUsers[user].messages.forEach((waitingMessage) => {
                    const messageData = {
                        username: waitingMessage.username,
                        message: waitingMessage.message,
                        time: waitingMessage.time,
                        room: user,
                        isRead: waitingMessage.isRead,
                        role: waitingMessage.role,
                        userId: waitingMessage.userId,
                        fcmToken: userFcmTokens[user]
                    };
                   
                });
                waitingUsers[user].messages = waitingUsers[user].messages.map((msg) => {
                    return {
                        ...msg,
                        isRead: true,
                    };
                });
            }
        });

        // Khi người dùng ngắt kết nối
        socket.on('disconnect', () => {
            const username = users[socket.id];
            if (username) {
                console.log(`${username} (ID: ${socket.id}) đã ngắt kết nối.`);
                delete users[socket.id];

            }
        });
    });

    return io;
};

module.exports = socketServer;
