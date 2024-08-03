const ProductService = require('../service/Product.service');
const response = require('../utils/ResponseUtil');

class ProductController {
    static async createProduct(req, res) {
        try {
            const data = await ProductService.createProduct(req, res);
            response.sendCreated(res, data.message, data.data);
        } catch (error) {
            console.log(error);
            response.sendError(res, error.message);
        }
    }

    static async getAllProduct(req, res) {
        try {
            const data = await ProductService.getAllProduct(req.query);
            response.sendSuccess(res, data.message, data.data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }

    static async getProductPagination(req, res) {
        try {
            const data = await ProductService.getProductPagination(req.query);
            response.sendSuccess(res, data.message, data.data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }

    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const data = await ProductService.getProductById(id);
            response.sendSuccess(res, data.message, data.data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }

    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const data = await ProductService.updateProduct(id, req);
            response.sendSuccess(res, data.message, data.data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const data = await ProductService.deleteProduct(id);
            response.sendSuccess(res, data.message, data.data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
}

module.exports = ProductController;