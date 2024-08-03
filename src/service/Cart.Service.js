const cartModel = require('../model/Cart.Model')

class CartService {
    static async createCart(user, products) {
        try {
            const cart = new cartModel({ user, products });
            await cart.save();
            return {
                status: 201,
                message: 'Tạo giỏ hàng thành công',
                data: cart
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getCartById(id) {
        try {
            const carts = await cartModel.findById(id);
            if (!carts) {
                throw new Error('Cart not found');
            }
            return {
                status: 200,
                message: 'Tìm thấy giỏ hàng',
                data: carts
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async updateCart(id, data) {
        try {
            const cart = await cartModel.findByIdAndUpdate(id, data,
                { new: true });
            if (!cart) {
                throw new Error('Cart not found');
            }
            return {
                status: 200,
                message: 'Cập nhật giỏ hàng thành công',
                data: cart
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async deleteCart(id) {
        try {
            const cart = await cartModel.findByIdAndDelete(id);
            if (!cart) {
                throw new Error('Cart not found');
            }
            return {
                status: 200,
                message: 'Xóa giỏ hàng thành công',
                data: cart
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            }
        }
    }

    static async getCartByUser(user) {
        try {
            const carts = await cartModel.find({ user: user }).populate('user')
            if (!carts || carts.length === 0) {
                throw new Error('No carts found');
            }
            return {
                status: 200,
                message: 'Found carts',
                data: carts
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            };
        }
    }

    static async getCartByIds(ids) {
        try {
            const carts = await cartModel.find({ _id: { $in: ids } });
            if (!carts || carts.length === 0) {
                throw new Error('No carts found');
            }
            return {
                status: 200,
                message: 'Found carts',
                data: carts
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            };
        }
    }

    static async updateCartStatusIds(ids, status) {
        try {
            const carts = await cartModel.updateMany({ _id: { $in: ids } }, { status: status });
            if (!carts) {
                throw new Error('No carts found');
            }
            return {
                status: 200,
                message: 'Updated carts',
                data: carts
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            };
        }
    }

    static async updateCartStatusRemove(id, status) {
        try {
            const cart = await cartModel.findByIdAndUpdate(id, { status: status }, { new: true });
            if (!cart) {
                throw new Error('Cart not found');
            }
            return {
                status: 200,
                message: 'Updated cart',
                data: cart
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null
            };
        }

    }

}

module.exports = CartService;
