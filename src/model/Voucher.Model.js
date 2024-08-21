const { default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const voucherSchema = new mongoose.Schema({
    userUsed: [
        {
            type: objectId,
            ref: 'users'
        }
    ],
    usersApplicable: [
        {
            type: objectId,
            ref: 'users'
        }
    ],
    name: {
        type: String,
    },
    images: {
        type: String,
    },
    code: {
        type: String,
    },
    discount: {
        type: Number,
    },
    description: {
        type: String,
    },
    condition: {
        type: String,
    },
    maxDiscountAmount: {
        type: Number,
        default: 500000
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    usageLimit: {
        type: Number,
        default: 100
    },
    paymentMethod: {
        type: String,
        enum: ['Nhận hàng tại nhà', 'Vnpay', 'Ngân hàng', 'Chuyển khoản', 'Trả góp'],
        default: 'Nhận hàng tại nhà'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'used', 'inactive'],
        default: 'active'
    },
    expirationDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const VoucherModel = mongoose.model('vouchers', voucherSchema);
module.exports = VoucherModel;
