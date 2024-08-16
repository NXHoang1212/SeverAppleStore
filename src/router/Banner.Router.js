const Router = require('express').Router();
const BannerController = require('../controller/Banner.Controller');
const { uploadMulterSingle } = require('../middleware/UploadFormAws');


Router.post('/admin/create', uploadMulterSingle, BannerController.createBanner);

Router.get('/get-all', BannerController.getAllBanner);

Router.get('/admin/detail/:id', BannerController.getBannerById);

Router.put('/admin/update/:id', uploadMulterSingle, BannerController.updateBanner);

Router.delete('/admin/delete/:id', BannerController.deleteBanner);

module.exports = Router;