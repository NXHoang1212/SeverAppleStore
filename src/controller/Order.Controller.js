const orderService = require('../service/Order.Service')

class OrderController {
    static async createPaymentUrl(req, res) {
        try {
            let orderData = {
                userId: req.body.userId,
                products: req.body.products,
                totalAmount: req.body.totalAmount,
                ipAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                bankCode: req.body.bankCode,
                shippingAddress: req.body.shippingAddress,
                shippingFee: req.body.shippingFee,
                language: req.body.language,
                voucher: req.body.voucher,
                note: req.body.note,
            };
            let paymentUrl = await orderService.createPaymentUrl(orderData);
            return res.status(200).json({
                status: 200,
                message: 'Successfully created payment URL',
                data: paymentUrl.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async handleVnpayReturnUrl(req, res) {
        try {
            let result = await orderService.handleVnpayReturnUrl(req.query);
            let order = result.data
            let deepLinkUrl;
            if (result.code === '00') {
                deepLinkUrl = `https://devnextstore.netlify.app/StackMisc/order/success?totalAmount=${order.totalAmount}&status=${order.status}&paymentStatus=${order.paymentStatus}&title=Thanh toán thành công`;
            } else {
                deepLinkUrl = `https://devnextstore.netlify.app/StackMisc/order/failed?totalAmount=${order.totalAmount}&status=${order.status}&paymentStatus=${order.paymentStatus}&title=Thanh toán thất bại`;
            }
            return res.redirect(deepLinkUrl);
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async handleReturnFromApp(req, res) {
        try {
            const { paymentCode } = req.query;
            const result = await orderService.handleReturnFromApp(paymentCode);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async handleVnpayIpnUrl(req, res) {
        try {
            let result = await orderService.handleIpn(req.query);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.RspCode,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getOrdersByUser(req, res) {
        try {
            const { user } = req.params;
            const result = await orderService.getOrdersByUser(user);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getOrdersById(req, res) {
        try {
            const { id } = req.params;
            const result = await orderService.getOrdersById(id);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getOrdersByStatus(req, res) {
        try {
            const { user } = req.params;
            const { status, paymentStatus } = req.query;
            const statusArray = status.split(',');
            const paymentStatusArray = paymentStatus.split(',');
            const result = await orderService.getOrdersByStatus(user, statusArray, paymentStatusArray);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async updateOrder(req, res) {
        try {
            const result = await orderService.updateOrder(req.params.id, req.body);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async createOrder(req, res) {
        try {
            const orderData = {
                userId: req.body.userId,
                products: req.body.products,
                totalAmount: req.body.totalAmount,
                paymentMethod: req.body.paymentMethod,
                shippingAddress: req.body.shippingAddress,
                shippingFee: req.body.shippingFee,
                voucher: req.body.voucher,
                note: req.body.note,
            }
            const result = await orderService.createOrder(orderData);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getAllOrders(req, res) {
        try {
            const result = await orderService.getAllOrders();
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getOrdersByStatusAndPaymentStatus(req, res) {
        try {
            const { status, paymentStatus } = req.query;
            const statusArray = status.split(',');
            const paymentStatusArray = paymentStatus.split(',');
            const result = await orderService.getOrdersByStatusAndPaymentStatus(statusArray, paymentStatusArray);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async adminConfirmOrder(req, res) {
        try {
            const { id } = req.params;
            const { data } = req.body;
            const result = await orderService.adminConfirmOrder(id, data);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            console.log("🚀 ~ OrderController ~ adminConfirmOrder ~ error:", error)
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getTopProducts(req, res) {
        try {
            const result = await orderService.getTopProducts();
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getRevenueByDate(req, res) {
        try {
            const result = await orderService.getRevenueByDate(req.params.period);
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }

    static async getCompareRevenue(req, res) {
        try {
            const result = await orderService.getCompareRevenue();
            return res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message,
                data: null,
            });
        }
    }
}

module.exports = OrderController;