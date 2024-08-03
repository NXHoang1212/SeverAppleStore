const { default: mongoose } = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        maxlength: 255,
    },
    fullname: {
        type: String,
    },
    phone: {
        type: String,
        maxlength: 10,
    },
    photoUrl: {
        type: String,
    },
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
    },
    provider: {
        type: String,
    },
    password: {
        type: String,
    },
    otp: {
        type: String,
    },
    role: {
        type: String,
        default: 'user',
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        default: Date.now(),
    },
    fcmToken: {
        type: [String],
    }
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
