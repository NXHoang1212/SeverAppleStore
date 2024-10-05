const { Server } = require('socket.io');
const moment = require('moment');
const { uploadSocketChatAws } = require('./UploadOtherAws');

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

        socket.on('uploadImage', async (file) => {
            try {
                const result = await uploadSocketChatAws(file); // Gọi phương thức upload lên AWS
                const imageUrl = result.Location; // Lấy URL của hình ảnh đã upload
                console.log("🚀 ~ file:", file);
                // Gửi URL hình ảnh tới người dùng trong room
                io.to(file.room).emit('userMessage', {
                    username: file.username,
                    imageUrl,
                    time: getVietnamTime(),
                    room: file.room,
                    isRead: true,
                    role: file.role,
                });
            } catch (error) {
                console.log("Failed to upload image", error);
                socket.emit('uploadError', { error: 'Failed to upload image' });
            }
        });


        // Xử lý khi người dùng gửi tin nhắn
        socket.on('sendMessage', ({ username, message, room, role, imageUrl }) => {
            const currentTime = getVietnamTime();

            if (!waitingUsers[room]) {
                waitingUsers[room] = { messages: [], username };
            }

            // Nếu có hình ảnh thì xử lý gửi tin nhắn hình ảnh
            if (imageUrl) {
                waitingUsers[room].messages.push({ username, imageUrl, time: currentTime, room, isRead: true, role });
                io.emit('newMessageFromUser', { username, imageUrl, time: currentTime, room, isRead: false, role });
                io.to(room).emit('userMessage', { username, imageUrl, time: currentTime, room, isRead: true, role });
            } else {
                // Xử lý gửi tin nhắn văn bản
                const userMessage = { username, message, time: currentTime, room, isRead: true, role };
                waitingUsers[room].messages.push(userMessage);
                io.emit('newMessageFromUser', userMessage);
                io.to(room).emit('userMessage', userMessage);
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
                        };
                        socket.emit('newMessageFromUser', messageData);
                    }
                });
            });
        });

        // Xử lý khi admin gửi tin nhắn
        socket.on('adminMessage', ({ room, message, role }) => {
            const currentTime = getVietnamTime();
            if (!waitingUsers[room]) {
                waitingUsers[room] = { messages: [] };
            }

            const adminMessage = { username: 'Admin', message, time: currentTime, room, isRead: true, role };

            waitingUsers[room].messages.push(adminMessage);

            io.to(room).emit('userMessage', adminMessage);
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
                    };
                    if (!(waitingMessage.username === 'Admin' && waitingMessage.message.includes('Xin chào'))) {
                        socket.emit('newMessageFromUser', messageData);
                    }
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
