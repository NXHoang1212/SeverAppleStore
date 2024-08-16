const router = require('express').Router();
const voucherController = require('../controller/Voucher.Controller');
const { uploadMulterSingle } = require('../middleware/UploadFormAws');

router.post('/create', uploadMulterSingle, voucherController.createVoucher);

router.get('/list/:usersApplicable', voucherController.getVoucherList);

router.get('/detail/:id', voucherController.getVoucherById);

router.post('/use', voucherController.useVoucher);

router.delete('/admin/delete/:id', voucherController.deleteVoucher);

router.put('/update/:id', uploadMulterSingle, voucherController.updateVoucher);

router.put('/reset-usage', voucherController.resetVoucherUsage);


module.exports = router;