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
            const order = await orderModel.findById(id);
            if (!order) {
                return {
                    status: 404,
                    message: 'Order not found',
                    data: null,
                };
            }
            const updatedOrder = await orderModel.findByIdAndUpdate
                (id, data, { new: true }).populate('user');
            if (order.user.fcmToken) {
                const token = order.user.fcmToken;
                const title = 'Đơn hàng của bạn đã được hủy';
                const body = `Đơn hàng ${order.orderCode} của bạn đã bị hủy`;
                const data = {
                    type: 'orderFailed',
                    userId: order.user._id,
                    orderId: order._id,
                };np
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

            if (updatedOrder.user.fcmToken && updatedOrder.user.fcmToken.length > 0) {
                const token = updatedOrder.user.fcmToken;
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
                } else if (data.status === 'Đã giao hàng') {
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
}

module.exports = OrderService;
