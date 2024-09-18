const { default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const evaluateSchema = new mongoose.Schema({
    order_id: {
        type: objectId,
        // required: true,
        ref: 'orders'
    },
    user_id: {
        type: objectId,
        // required: true,
        ref: 'users'
    },
    rating: {
        type: Number,
        // required: true,
        min: 1,
        max: 5
    },
    detail: {
        type: Object,
        default: ''
    },
    comment: {
        type: String,
        // required: true,
        trim: true
    },
    media: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        default: 'Chưa đánh giá',
        enum: ['Chưa đánh giá', 'Đã đánh giá']
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
    }
});

const EvaluateModel = mongoose.model('evaluates', evaluateSchema);
module.exports = EvaluateModel