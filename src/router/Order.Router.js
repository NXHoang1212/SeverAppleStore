const router = require('express').Router();
const orderController = require('../controller/Order.Controller')


router.post('/create_payment_url', orderController.createPaymentUrl);

router.get('/vnpay_return', orderController.handleVnpayReturnUrl);

router.get('/return_from_app', orderController.handleReturnFromApp);

router.get('/vnpay_ipn', orderController.handleVnpayIpnUrl);

router.get('/get_orders_by_user/:user', orderController.getOrdersByUser);

router.get('/get_orders_by_id/:id', orderController.getOrdersById);

router.get('/get_orders_user_status/:user', orderController.getOrdersByStatus);

router.put('/update_order/:id', orderController.updateOrder);

router.post('/create_order', orderController.createOrder);

module.exports = router;