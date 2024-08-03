const Router = require('express').Router();
const BannerController = require('../controller/Banner.Controller');
const { uploadMulterSingle } = require('../middleware/UploadFormAws');


Router.post('/create', uploadMulterSingle, BannerController.createBanner);

Router.get('/get-all', BannerController.getAllBanner);

Router.put('/update/:id', uploadMulterSingle, BannerController.updateBanner);

Router.delete('/delete/:id', BannerController.deleteBanner);

module.exports = Router;