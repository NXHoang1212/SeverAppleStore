const router = require('express').Router();
const orderController = require('../controller/Order.Controller')

/*User Router*/
router.post('/create_payment_url', orderController.createPaymentUrl);

router.get('/vnpay_return', orderController.handleVnpayReturnUrl);

router.get('/return_from_app', orderController.handleReturnFromApp);

router.get('/vnpay_ipn', orderController.handleVnpayIpnUrl);

router.get('/get_orders_by_user/:user', orderController.getOrdersByUser);

router.get('/get_orders_by_id/:id', orderController.getOrdersById);

router.get('/get_orders_user_status/:user', orderController.getOrdersByStatus);

router.put('/update_order/:id', orderController.updateOrder);

router.post('/create_order', orderController.createOrder);

/*Admin Router*/
router.get('/admin/get_all_orders', orderController.getAllOrders);

router.put('/admin/update_order/:id', orderController.updateOrder);

router.get('/admin/get_orders_status_paymentStatus', orderController.getOrdersByStatusAndPaymentStatus);

router.put('/admin/confirm_order/:id', orderController.adminConfirmOrder);

router.get('/admin/getTopProducts', orderController.getTopProducts);

router.get('/admin/getRevenue/:period', orderController.getRevenueByDate);

router.get('/admin/compare-revenuen', orderController.getCompareRevenue);

module.exports = router;