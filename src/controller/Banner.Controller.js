const bannerService = require('../service/Banner.Service');
const response = require('../utils/ResponseUtil');

class BannerController {
    static async createBanner(req, res) {
        try {
            const result = await bannerService.createBanner(req, res);
            response.sendCreated(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async getAllBanner(req, res) {
        try {
            const result = await bannerService.getAllBanner(req, res);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async getBannerById(req, res) {
        try {
            const { id } = req.params;
            const result = await bannerService.getBannerById(id);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async updateBanner(req, res) {
        try {
            const { id } = req.params;
            const result = await bannerService.updateBanner(id, req);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async deleteBanner(req, res) {
        try {
            const { id } = req.params;
            const result = await bannerService.deleteBanner(id);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }
}

module.exports = BannerController;