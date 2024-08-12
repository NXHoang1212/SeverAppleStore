const Router = require('express').Router();
const productController = require('../controller/Product.Controller');
const { uploadMulter } = require('../middleware/UploadFormAws');

Router.post('/admin/createProducts', uploadMulter, productController.createProduct);

Router.get('/get-all', productController.getAllProduct);

Router.get('/get-pagination', productController.getProductPagination);

Router.get('/getdetail/:id', productController.getProductById);

Router.put('/admin/updateProducts/:id', uploadMulter, productController.updateProduct);

Router.delete('/admin/deleteProducts/:id', productController.deleteProduct);

module.exports = Router;