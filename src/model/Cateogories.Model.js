const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    images: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        default: Date.now(),
    },
});

const categoriesModel = mongoose.model('categories', categoriesSchema);
module.exports = categoriesModel;
