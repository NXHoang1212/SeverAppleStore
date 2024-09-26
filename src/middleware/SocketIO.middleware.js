const { Server } = require('socket.io');

const socketServer = (socketPort) => {
    const io = new Server(socketPort, {
        cors: {
            origin: 'http://localhost:5000', // Thay bằng domain của bạn nếu cần
            methods: ['GET', 'POST'],
        },
    });

    const users = {}; // Lưu người dùng theo socketId
    const rooms = {}; // Lưu danh sách phòng và người dùng trong từng phòng
    const waitingUsers = []; // Lưu danh sách user đang chờ phản hồi từ admin

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Khi người dùng tham gia phòng
        socket.on('joinRoom', ({ username, room, role }) => {
            users[socket.id] = username; // Lưu tên người dùng theo socketId
            socket.join(room);  // Người dùng tham gia vào phòng

            // Nếu là user thì mới gửi tin nhắn chào mừng từ admin
            if (role === 'user') {
                const welcomeMessage = {
                    username: 'Admin',
                    message: 'Xin chào, bạn cần hỗ trợ gì ạ?',
                };
                socket.emit('adminMessage', welcomeMessage);
            }
        });

        // Xử lý khi người dùng gửi tin nhắn
        socket.on('sendMessage', ({ username, message, room, role }) => {
            console.log(`${username} (Role: ${role}) gửi tin nhắn: ${message} trong phòng: ${room}`);

            // Lấy thời gian gửi tin nhắn
            const currentTime = new Date().toLocaleTimeString();

            // Thêm user vào danh sách chờ nếu admin chưa phản hồi
            if (!waitingUsers.includes(username)) {
                waitingUsers.push(username);
                io.emit('newMessageFromUser', { name: username, message, time: currentTime, room }); // Gửi sự kiện với thông tin chi tiết
                console.log(`User ${username} đã gửi tin nhắn và đang chờ phản hồi.`);
            }

            // Phát tin nhắn tới tất cả thành viên trong phòng
            io.to(room).emit('adminMessage', { username, message, time: currentTime, role });
        });

        // Xử lý khi admin gửi tin nhắn
        socket.on('adminMessage', ({ room, message }) => {
            console.log(`Admin gửi tin nhắn: ${message} trong phòng: ${room}`);

            // Phát tin nhắn từ admin tới người dùng trong phòng
            io.to(room).emit('userMessage', { username: 'Admin', message });
        });

        // Xử lý khi admin tham gia phòng chat của user
        socket.on('joinUserRoom', ({ admin, user }) => {
            const room = user;
            socket.join(room); // Admin tham gia phòng chat của user
            console.log(`Admin đã tham gia phòng chat của ${user}`);
        });

        // Khi người dùng ngắt kết nối
        socket.on('disconnect', () => {
            const username = users[socket.id];
            if (username) {
                Object.keys(rooms).forEach((room) => {
                    // Xóa người dùng khỏi phòng
                    rooms[room] = rooms[room].filter(user => user !== username);

                    // Thông báo cho các thành viên khác trong phòng về việc người dùng rời đi
                    io.to(room).emit('message', `${username} đã rời khỏi phòng.`);
                    io.to(room).emit('roomData', { room, users: rooms[room] });
                });
                console.log(`${username} (ID: ${socket.id}) đã ngắt kết nối.`);

                // Xóa user khỏi danh sách chờ nếu có
                // const index = waitingUsers.indexOf(username);
                // if (index !== -1) {
                //     waitingUsers.splice(index, 1);
                // }

                delete users[socket.id];
            }
        });
    });

    return io;
};

module.exports = socketServer;
