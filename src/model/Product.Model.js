const { default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const ProductSchema = new mongoose.Schema({
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
    priceColor: [
        {
            color: { type: String, required: true },
            price: { type: Number, required: true },
        }
    ],
    images: [
        {
            type: String,
        }
    ],
    description: {
        type: String,
    },
    category: {
        type: objectId,
        ref: 'categories',
    },
    brand: {
        type: String,
    },
    stock: {
        type: Number,
        default: 0,
    },
    specifications: {
        screen: { type: String },// Màn hình
        battery: { type: String },// Pin
        memory: { type: String },// Bộ nhớ
        camera: { type: String },// Camera
        processor: { type: String },// Bộ xử lý
        weight: { type: String }, // Trọng lượng
        dimensions: { type: String }, // Kích thước
    },
    status: {
        type: String,
        default: 'available',
    },
    discount: {
        percentage: { type: Number, min: 0, max: 100, default: 0 },
        description: { type: String }
    },
    condition: {
        type: String,
        default: 'NewSeal',
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        default: Date.now(),
    }
});

const ProductModel = mongoose.model('products', ProductSchema);
module.exports = ProductModel;
