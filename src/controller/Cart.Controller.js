const cartSerivce = require('../service/Cart.Service');
const response = require('../utils/ResponseUtil');


class CartController {
    static async createCart(req, res) {
        try {
            const { user, products } = req.body;
            const cart = await cartSerivce.createCart(user, products);
            response.sendCreated(res, cart.message, cart.data);
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    static async getCartById(req, res) {
        try {
            const { id } = req.params;
            const carts = await cartSerivce.getCartById(id);
            response.sendSuccess(res, carts.message, carts.data);
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    static async updateCart(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const cart = await cartSerivce.updateCart(id, data);
            response.sendSuccess(res, cart.message, cart.data);
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    static async deleteCart(req, res) {
        try {
            const { id } = req.params;
            const cart = await cartSerivce.deleteCart(id);
            response.sendSuccess(res, cart.message, cart.data);
        } catch (error) {
            return response.sendError(res, error);
        }
    }

    static async getCartByUser(req, res) {
        try {
            const { user } = req.params;
            const carts = await cartSerivce.getCartByUser(user);
            response.sendSuccess(res, carts.message, carts.data);
        } catch (error) {
            response.sendError(res, error);
        }
    }

    static async getCartsIds(req, res) {
        try {
            const { ids } = req.body
            const carts = await cartSerivce.getCartByIds(ids);
            response.sendSuccess(res, carts.message, carts.data);
        } catch (error) {
            response.sendError(res, error);
        }
    }

    static async updateCartStatusIds(req, res) {
        try {
            const { ids, status } = req.body;
            const carts = await cartSerivce.updateCartStatusIds(ids, status);
            response.sendSuccess(res, carts.message, carts.data);
        } catch (error) {
            response.sendError(res, error);
        }
    }

    static async updateCartStatusRemove(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const carts = await cartSerivce.updateCartStatusRemove(id, status);
            response.sendSuccess(res, carts.message, carts.data);
        } catch (error) {
            response.sendError(res, error);
        }
    }

}

module.exports = CartController;