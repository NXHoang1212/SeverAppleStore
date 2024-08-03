const { default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;


const AddressSchema = new mongoose.Schema({
    user_id: {
        type: objectId,
        ref: 'users',
        required: true
    },
    houseNumber: {
        type: String,
    },
    ward: {
        type: String,
    },
    district: {
        type: String,
    },
    province: {
        type: String,
    },
    phone: {
        type: String,
    },
    name: {
        type: String,
    },
    addressType: {
        type: String,
        enum: ['Nhà riêng', 'Văn phòng'],
        default: 'Nhà riêng'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const AddressModel = mongoose.model('address', AddressSchema);
module.exports = AddressModel;