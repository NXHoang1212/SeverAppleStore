const { default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({
    user: {
        type: objectId,
        ref: 'users',
    },
    products: {
        _id: {
            type: objectId,
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
        }
    },
    quantity: {
        type: Number,
        default: 1,
    },
    status: {
        type: String,
        enum: ['giỏ hàng', 'Đã đặt hàng', 'Đã xóa'],
        default: 'giỏ hàng',
    },
}, {
    timestamps: true,
});

const CartModel = mongoose.model('carts', cartSchema);
module.exports = CartModel;