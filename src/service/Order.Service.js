const orderModel = require('../model/Order.Model');
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const config = require('config');
const generateOrderCode = require('../utils/GenerateOrderCode')
const { sendNotification } = require('../utils/HandlePushNotification')

function sortObject(obj) {
    try {
        let sorted = {};
        let str = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (let key of str) {
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        }
        return sorted;
    } catch (error) {
        return {
            status: 500,
            message: error.message,
            data: null,
        };
    }
}

class OrderService {
    static async createPaymentUrl(orderData) {
        try {
            process.env.TZ = 'Asia/Ho_Chi_Minh';
            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');
            let orderId = moment(date).format('DDHHmmss');
            let amount = orderData.totalAmount * 100; // VNPay expects amount in VND
            let ipAddr = orderData.ipAddr;
            let bankCode = orderData.bankCode || '';
            let locale = orderData.language || 'vn';
            let currCode = 'VND';
            let tmnCode = config.get('vnp_TmnCode');
            let secretKey = config.get('vnp_HashSecret');
            let vnpUrl = config.get('vnp_Url');
            let returnUrl = config.get('vnp_ReturnUrl'); // Ensure this is a public URL

            let vnp_Params = {
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': tmnCode,
                'vnp_Locale': locale,
                'vnp_CurrCode': currCode,
                'vnp_TxnRef': orderId,
                'vnp_OrderInfo': `Thanh toan cho ma GD:${orderId}`,
                'vnp_OrderType': 'other',
                'vnp_Amount': amount,
                'vnp_ReturnUrl': returnUrl,
                'vnp_IpAddr': ipAddr,
                'vnp_CreateDate': createDate,
            };

            if (bankCode) {
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            vnp_Params = sortObject(vnp_Params);
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;

            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

            let orderCode = generateOrderCode.generateCode();

            const newOrder = new orderModel({
                user: orderData.userId,
                products: orderData.products,
                totalAmount: orderData.totalAmount,
                paymentMethod: 'Vnpay',
                shippingAddress: orderData.shippingAddress,
                shippingFee: orderData.shippingFee,
                voucher: orderData.voucher,
                note: orderData.note,
                paymentCode: orderId,
                orderCode: orderCode,
            });

            const order = await newOrder.save();

            return {
                status: 200,
                message: 'Successfully created payment URL',
                data: { vnpUrl, order },
            };
        } catch (error) {
            console.log("🚀 ~ OrderService ~ createPaymentUrl ~ error:", error);
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async handleVnpayReturnUrl(vnp_Params) {
        try {
            let secureHash = vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];
            vnp_Params = sortObject(vnp_Params);

            let secretKey = config.get('vnp_HashSecret');
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            if (secureHash === signed) {
                let order = await orderModel.findOne({ paymentCode: vnp_Params['vnp_TxnRef'] }).populate('user');
                if (order) {
                    if (vnp_Params['vnp_ResponseCode'] === "00") {
                        order.paymentStatus = 'Đã thanh toán';
                        order.updatedAt = Date.now();
                        await order.save();
                        if (order.user.fcmToken) {
                            let title = 'Đơn hàng của bạn đã được thanh toán';
                            let body = `Đơn hàng ${order.orderCode} của bạn đã được thanh toán thành công`;
                            let data = {
                                type: 'orderSuccess',
                            };
                            await sendNotification(order.user.fcmToken, title, body, data);
                        } else {
                            console.log('No fcmToken found');
                        }
                        return {
                            code: '00',
                            message: 'Success',
                            data: order,
                        };
                    } else {
                        order.paymentStatus = 'Chờ thanh toán';
                        order.updatedAt = Date.now();
                        await order.save();
                        if (order.user.fcmToken) {
                            let title = 'Đơn hàng của bạn chưa được thanh toán';
                            let body = `Đơn hàng ${order.orderCode} của bạn chưa được thanh toán`;
                            let data = {
                                type: 'orderFailed',
                            };
                            await sendNotification(order.user.fcmToken, title, body, data);
                        } else {
                            console.log('No fcmToken found');
                        }
                        return {
                            code: '01',
                            message: 'Unsuccessful payment',
                        };
                    }
                } else {
                    return {
                        code: '01',
                        message: 'Order not found',
                    };
                }
            } else {
                return {
                    code: '97',
                    message: 'Checksum failed',
                };
            }

        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async handleReturnFromApp(paymentCode) {
        try {
            if (!paymentCode) {
                return {
                    status: 400,
                    message: 'Payment code is required',
                    data: null,
                };
            }
            const order = await orderModel.findOne({ paymentCode: paymentCode });
            if (!order) {
                return {
                    status: 404,
                    message: 'Order not found',
                    data: null,
                };
            }
            if (order.paymentStatus === 'Chờ thanh toán') {
                return {
                    status: 200,
                    message: 'Order status is pending',
                    data: order,
                };
            }
            return {
                status: 200,
                message: 'Order status is paid',
                data: order,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async handleIpn(vnp_Params) {
        try {
            let secureHash = vnp_Params['vnp_SecureHash'];
            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];
            vnp_Params = sortObject(vnp_Params);

            let secretKey = config.get('vnp_HashSecret');
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            if (secureHash === signed) {
                let order = await orderModel.findOne({ paymentCode: orderId });

                if (order) {
                    if (rspCode === "00") {
                        order.paymentStatus = 'Đã thanh toán';
                        order.updatedAt = Date.now();
                    } else {
                        order.paymentStatus = 'Chờ thanh toán';
                        order.updatedAt = Date.now();
                    }
                    await order.save();
                    return {
                        RspCode: '00',
                        Message: 'Success',
                    };
                } else {
                    return {
                        RspCode: '01',
                        Message: 'Order not found',
                    };
                }
            } else {
                return {
                    RspCode: '97',
                    Message: 'Checksum failed'
                };
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async getOrdersByUser(user) {
        try {
            const orders = await orderModel.find({ user: user }).populate('shippingAddress').populate('voucher').populate('user');
            if (!orders) {
                return {
                    status: 404,
                    message: 'No orders found',
                    data: null,
                };
            }
            return {
                status: 200,
                message: 'Successfully fetched orders',
                data: orders,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async getOrdersByStatus(user, status, paymentStatus) {
        try {
            const orders = await orderModel.find({
                user: user,
                $or: [
                    { status: { $in: status }, status: { $nin: ["Đang giao", "Đã giao", "Đã hủy"] } },
                    { paymentStatus: { $in: paymentStatus }, status: { $nin: ["Đang giao", "Đã giao", "Đã hủy"] } }
                ]
            }).populate('shippingAddress').populate('voucher').populate('user');
            if (!orders) {
                return {
                    status: 404,
                    message: 'No orders found',
                    data: null,
                };
            }
            return {
                status: 200,
                message: 'Successfully fetched orders',
                data: orders,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async getOrdersById(id) {
        try {
            const order = await orderModel.findById(id).populate('shippingAddress').populate('voucher').populate('user');
            return {
                status: 200,
                message: 'Successfully fetched order',
                data: order,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async updateOrder(id, data) {
        try {
            const order = await orderModel.findById(id).populate('user');
            if (!order) {
                return {
                    status: 404,
                    message: 'Order not found',
                    data: null,
                };
            }
            const updatedOrder = await orderModel.findByIdAndUpdate
                (id, data, { new: true, runValidators: true })
            if (order.user.fcmToken) {
                const token = order.user.fcmToken;
                const title = 'Đơn hàng của bạn đã được hủy';
                const body = `Đơn hàng ${order.orderCode} của bạn đã bị hủy vào lúc ${moment(updatedOrder.updatedAt).format('HH:mm DD/MM/YYYY')}`;
                const data = {
                    type: 'orderFailed',
                    userId: order.user._id,
                    orderId: order._id,
                };
                await sendNotification(token, title, body, data);
                console.log('Sent notification');
            }
            return {
                status: 200,
                message: 'Order updated successfully',
                data: updatedOrder,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async createOrder(orderData) {
        try {
            const orderCode = generateOrderCode.generateCode();
            const paymentCode = generateOrderCode.generatePaymentCode();
            const newOrder = new orderModel({
                user: orderData.userId,
                products: orderData.products,
                totalAmount: orderData.totalAmount,
                status: 'Chờ xác nhận',
                paymentMethod: orderData.paymentMethod,
                paymentStatus: 'Chờ thanh toán',
                shippingAddress: orderData.shippingAddress,
                shippingFee: orderData.shippingFee,
                voucher: orderData.voucher,
                note: orderData.note,
                paymentCode: paymentCode,
                orderCode: orderCode,
            });
            const order = await newOrder.save();
            const populatedOrder = await orderModel.findById(order._id).populate('user');
            if (populatedOrder.user && populatedOrder.user.fcmToken) {
                const token = populatedOrder.user.fcmToken;
                const title = 'Đơn hàng của bạn đã được tạo thành công';
                const body = `Đơn hàng ${order.orderCode} của bạn đã được tạo thành công`;
                const data = {
                    type: 'orderSuccess',
                    userId: populatedOrder.user._id,
                    orderId: populatedOrder._id,
                };
                await sendNotification(token, title, body, data);
                console.log('Sent notification');
            } else {
                console.log('No fcmToken found');
            }
            return {
                status: 200,
                message: 'Order created successfully',
                data: newOrder,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async getAllOrders() {
        try {
            const orders = await orderModel.find().populate('shippingAddress').populate('voucher').populate('user');
            return {
                status: 200,
                message: 'Successfully fetched orders',
                data: orders,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async getOrdersByStatusAndPaymentStatus(status, paymentStatus) {
        try {
            const orders = await orderModel.find({
                status: { $in: status },
                paymentStatus: { $in: paymentStatus },
            }).populate('shippingAddress').populate('voucher').populate('user');
            return {
                status: 200,
                message: 'Successfully fetched orders',
                data: orders,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async adminConfirmOrder(id, data) {
        try {
            const order = await orderModel.findById(id).populate('user');
            if (!order) {
                return {
                    status: 404,
                    message: 'Order not found',
                    data: null,
                };
            }
            const updatedOrder = await orderModel.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            ).populate('user');

            if (order.user.fcmToken && order.user.fcmToken.length > 0) {
                const token = order.user.fcmToken;
                let title, body, notificationData;

                if (data.status === 'Đã xác nhận') {
                    title = 'Đơn hàng của bạn đã được xác nhận';
                    body = `Đơn hàng ${updatedOrder.orderCode} của bạn đã được xác nhận thành công vào lúc ${moment(updatedOrder.updatedAt).format('HH:mm DD/MM/YYYY')}`;
                    notificationData = {
                        type: 'orderSuccess',
                        userId: updatedOrder.user._id,
                        orderId: updatedOrder._id,
                    };
                } else if (data.status === 'Đang giao') {
                    title = 'Đơn hàng của bạn đang được giao';
                    body = `Đơn hàng ${updatedOrder.orderCode} của bạn đang trên đường đến bạn`;
                    notificationData = {
                        type: 'orderSuccess',
                        userId: updatedOrder.user._id,
                        orderId: updatedOrder._id,
                    };
                } else if (data.status === 'Đã giao') {
                    title = 'Đơn hàng của bạn đã được giao';
                    body = `Đơn hàng ${updatedOrder.orderCode} của bạn đã được giao thành công`;
                    notificationData = {
                        type: 'orderSuccess',
                        userId: updatedOrder.user._id,
                        orderId: updatedOrder._id,
                    };
                } else if (data.status === 'Đã hủy') {
                    title = 'Đơn hàng của bạn đã bị hủy';
                    body = `Đơn hàng ${updatedOrder.orderCode} của bạn đã bị hủy`;
                    notificationData = {
                        type: 'orderFailed',
                        userId: updatedOrder.user._id,
                        orderId: updatedOrder._id,
                    };
                }
                if (title && body && notificationData) {
                    await sendNotification(token, title, body, notificationData);
                }
            }
            return {
                status: 200,
                message: 'Order updated successfully',
                data: updatedOrder,
            };
        } catch (error) {
            console.error('Error in adminConfirmOrder:', error);
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async getTopProducts() {
        try {
            const orders = await orderModel.find({ status: 'Đã giao' });
            let products = [];
            orders.forEach(order => {
                order.products.forEach(product => {
                    let found = products.find(p => p._id.toString() === product._id.toString());
                    if (found) {
                        found.quantity += product.quantity;
                    } else {
                        products.push({
                            _id: product._id,
                            quantity: product.quantity,
                        });
                    }
                });
            });
            products.sort((a, b) => b.quantity - a.quantity);
            return {
                status: 200,
                message: 'Successfully fetched top products',
                data: products,
            };
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async getRevenueByDate(period) {
        try {
            const now = new Date();
            let startDate;

            // Xác định thời gian bắt đầu theo khoảng thời gian yêu cầu
            switch (period) {
                case 'daily':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'weekly':
                    const day = now.getDay(); // Ngày trong tuần
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
                    break;
                case 'monthly':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'yearly':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    throw new Error('Không hỗ trợ thống kê theo khoảng thời gian này');
            }

            const orders = await orderModel.aggregate([
                {
                    $match: {
                        status: 'Đã giao',
                        updatedAt: { $gte: startDate, $lte: now }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                }
            ]);

            const totalRevenue = orders.length > 0 ? orders[0].totalRevenue : 0;

            return {
                status: 200,
                message: 'Successfully fetched revenue',
                data: { totalRevenue, period },
            };

        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

    static async getCompareRevenue() {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            // Hàm tính toán số ngày trong năm
            function getDayOfYear(date) {
                const start = new Date(date.getFullYear(), 0, 0);
                const diff = date - start;
                const oneDay = 1000 * 60 * 60 * 24;
                return Math.floor(diff / oneDay);
            }

            // Hàm tính toán ISO week của năm
            function getISOWeek(date) {
                const target = new Date(date.valueOf());
                const dayNr = (date.getDay() + 6) % 7;
                target.setDate(target.getDate() - dayNr + 3);
                const firstThursday = target.valueOf();
                target.setMonth(0, 1);
                if (target.getDay() !== 4) {
                    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
                }
                return 1 + Math.ceil((firstThursday - target) / (7 * 24 * 60 * 60 * 1000));
            }

            const result = await orderModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(now.getFullYear() - 1, 0, 1),
                            $lt: new Date(now.getFullYear() + 1, 0, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            week: { $isoWeek: "$createdAt" },
                            day: { $dayOfYear: "$createdAt" }
                        },
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                }
            ]);

            // Tính toán doanh thu
            const todayRevenue = result.find(r => r._id.year === now.getFullYear() && r._id.day === getDayOfYear(today))?.totalRevenue || 0;
            const yesterdayRevenue = result.find(r => r._id.year === now.getFullYear() && r._id.day === getDayOfYear(yesterday))?.totalRevenue || 0;

            const thisWeekRevenue = result.filter(r => r._id.year === now.getFullYear() && r._id.week === getISOWeek(now)).reduce((sum, r) => sum + r.totalRevenue, 0);
            const lastWeekRevenue = result.filter(r => r._id.year === now.getFullYear() && r._id.week === (getISOWeek(now) - 1)).reduce((sum, r) => sum + r.totalRevenue, 0);

            const thisMonthRevenue = result.filter(r => r._id.year === now.getFullYear() && r._id.month === (now.getMonth() + 1)).reduce((sum, r) => sum + r.totalRevenue, 0);
            const lastMonthRevenue = result.filter(r => r._id.year === now.getFullYear() && r._id.month === (now.getMonth())).reduce((sum, r) => sum + r.totalRevenue, 0);

            const thisYearRevenue = result.filter(r => r._id.year === now.getFullYear()).reduce((sum, r) => sum + r.totalRevenue, 0);
            const lastYearRevenue = result.filter(r => r._id.year === now.getFullYear() - 1).reduce((sum, r) => sum + r.totalRevenue, 0);

            return {
                status: 200,
                message: 'Successfully fetched revenue',
                data: {
                    todayRevenue,
                    yesterdayRevenue,
                    thisWeekRevenue,
                    lastWeekRevenue,
                    thisMonthRevenue,
                    lastMonthRevenue,
                    thisYearRevenue,
                    lastYearRevenue
                },
            }
        } catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }

}

module.exports = OrderService;
