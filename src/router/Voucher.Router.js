const router = require('express').Router();
const voucherController = require('../controller/Voucher.Controller');
const { uploadMulterSingle } = require('../middleware/UploadFormAws');

router.post('/admin/create', uploadMulterSingle, voucherController.createVoucher);

router.get('/list/:usersApplicable', voucherController.getVoucherList);

router.get('/detail/:id', voucherController.getVoucherById);

router.post('/use', voucherController.useVoucher);

router.put('/update/:id', uploadMulterSingle, voucherController.updateVoucher);

router.put('/reset-usage', voucherController.resetVoucherUsage);

router.get('/admin/list/get-all', voucherController.getAllVoucher);

router.put('/admin/updateVoucher/:id', uploadMulterSingle, voucherController.updateAdminVoucher);

router.delete('/admin/delete/:id', voucherController.deleteVoucher);

router.get('/admin/detail/:id', voucherController.getVoucherById);


module.exports = router;