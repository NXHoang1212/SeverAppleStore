const favouritesService = require('../service/Favourites.Service');
const response = require('../utils/ResponseUtil');

class FavouritesController {
    static async addToFavourites(req, res) {
        try {
            const { productId, userId } = req.body;
            const favourite = await favouritesService.addToFavourites(userId, productId);
            response.sendCreated(res, favourite.message, favourite.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async getFavourites(req, res) {
        try {
            const { userId } = req.query;
            const favourites = await favouritesService.getFavourites(userId);
            response.sendSuccess(res, favourites.message, favourites.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async removeFromFavourites(req, res) {
        try {
            const { id } = req.params;
            const favourite = await favouritesService.removeFromFavourites(id);
            response.sendSuccess(res, favourite.message, favourite.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }
}

module.exports = FavouritesController;