const mongoose = require('mongoose');

require('dotenv').config();


const Database = {
    connect: () => {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                console.log('🚀 Mongoose kết nối thành công 🚀');
            })
            .catch((error) => {
                console.log('🚀 Mongoose kết nối thất bại 🚀');
                process.exit(1);
            });
    }
}

module.exports = Database;