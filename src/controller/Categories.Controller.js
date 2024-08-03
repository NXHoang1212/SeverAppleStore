const categoryService = require('../service/Categories.Service');
const response = require('../utils/ResponseUtil');

class CategoriesController {
    static async createCategory(req, res) {
        try {
            const result = await categoryService.createCategory(req, res);
            response.sendCreated(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async getAllCategory(req, res) {
        try {
            const result = await categoryService.getAllCategory(req, res);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async getCategoryById(req, res) {
        try {
            const result = await categoryService.getCategoryById(req.params.id);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const result = await categoryService.updateCategory(id, req);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const result = await categoryService.deleteCategory(id);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }
}


module.exports = CategoriesController;