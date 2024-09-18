const { default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
    user: {
        type: objectId,
        ref: 'users',
    },
    products: [{
        _id: {
            type: objectId,
            ref: 'products',
        },
        name: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        storage: {
            type: String,
        },
        priceColor: {
            color: { type: String, required: true },
            price: { type: Number, required: true },
            image: { type: String, required: true },
        },
        quantity: {
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy', 'Đã nhận được hàng'],
        default: 'Chờ xác nhận',
    },
    paymentMethod: {
        type: String,
        enum: ['Nhận hàng tại nhà', 'Vnpay', 'Ngân hàng', 'Chuyển khoản', 'Trả góp'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Chờ thanh toán', 'Đã thanh toán', 'Đã hủy'],
        default: 'Chờ thanh toán',
    },
    shippingAddress: {
        type: objectId,
        ref: 'address'
    },
    shippingFee: {
        type: Number,
        default: 0,
    },
    voucher: {
        type: objectId,
        ref: 'vouchers',
    },
    note: {
        type: String,
        default: 'Chưa có ghi chú',
    },
    //lý do hủy đơn hàng
    reasonCancel: {
        type: String,
    },
    //mã thanh toán
    paymentCode: {
        type: String,
    },
    //mã đơn hàng
    orderCode: {
        type: String,
    },
    //thời gian tạo đơn hàng
    createdAt: {
        type: Date,
        default: Date.now,
    },
    //thời gian cập nhật đơn hàng
    updatedAt: {
        type: Date,
    },
    //thời gian giao hàng
    deliveredAt: {
        type: Date,
    },
    //thời gian hủy đơn hàng
    canceledAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

const OrderModel = mongoose.model('orders', orderSchema);
module.exports = OrderModel;
