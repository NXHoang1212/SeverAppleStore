const voucherService = require('../service/Voucher.Service');
const response = require('../utils/ResponseUtil');

class VoucherController {
    static async createVoucher(req, res) {
        try {
            const { name, code, discount, description, maxDiscountAmount, minOrderAmount, usageLimit, paymentMethod, usersApplicable, expirationDate, condition } = req.body;
            const images = req.file;
            const result = await voucherService.createVoucher(name, code, discount, description, condition, maxDiscountAmount, minOrderAmount, expirationDate, usageLimit, paymentMethod, usersApplicable, images);
            response.sendCreated(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async getVoucherList(req, res) {
        try {
            const { usersApplicable } = req.params;
            const userId = req.query.userId
            const result = await voucherService.getVoucherList(usersApplicable, userId);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async getVoucherById(req, res) {
        try {
            const { id } = req.params;
            const result = await voucherService.getVoucherById(id);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async useVoucher(req, res) {
        try {
            const { id, userId, paymentMethod } = req.body;
            const result = await voucherService.useVoucher(id, userId, paymentMethod);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async deleteVoucher(req, res) {
        try {
            const { id } = req.params;
            const result = await voucherService.deleteVoucher(id);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async updateVoucher(req, res) {
        try {
            const { id } = req.params;
            const result = await voucherService.updateVoucher(id, req);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }

    static async resetVoucherUsage(req, res) {
        try {
            const { id, userId } = req.body;
            const result = await voucherService.resetVoucherUsage(id, userId);
            response.sendSuccess(res, result.message, result.data);
        } catch (error) {
            response.sendError(res, error.message);
        }
    }
}

module.exports = VoucherController;