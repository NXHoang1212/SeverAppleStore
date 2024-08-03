const { default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const FavouritesSchema = new mongoose.Schema({
    userId: {
        type: objectId,
        ref: 'users',
        required: true,
    },
    productId: {
        type: objectId,
        ref: 'products',
        required: true,
    },
},
    { timestamps: true }
);

const Favourites = mongoose.model('favourites', FavouritesSchema);
module.exports = Favourites;