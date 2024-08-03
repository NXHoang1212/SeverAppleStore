const Router = require('express').Router();
const productController = require('../controller/Product.Controller');
const { uploadMulter } = require('../middleware/UploadFormAws');

Router.post('/create', uploadMulter, productController.createProduct);

Router.get('/get-all', productController.getAllProduct);

Router.get('/get-pagination', productController.getProductPagination);

Router.get('/getdetail/:id', productController.getProductById);

Router.put('/update/:id', uploadMulter, productController.updateProduct);

Router.delete('/delete/:id', productController.deleteProduct);

module.exports = Router;