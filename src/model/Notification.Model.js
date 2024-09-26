const { default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    data: {
        type: { type: String },
        id: { type: String },
        userId: { type: objectId, ref: 'users' },
        orderId: { type: objectId, ref: 'orders' },
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

});

const NotificationModel = mongoose.model('notifications', NotificationSchema);
module.exports = NotificationModel;