const Router = require('express').Router();
const CateogoryController = require('../controller/Categories.Controller');
const { uploadMulterSingle } = require('../middleware/UploadFormAws');

Router.post('/admin/create', uploadMulterSingle, CateogoryController.createCategory);

Router.get('/get-all', CateogoryController.getAllCategory);

Router.get('/detail/:id', CateogoryController.getCategoryById);

Router.put('/admin/update/:id', uploadMulterSingle, CateogoryController.updateCategory);

Router.delete('/admin/delete/:id', CateogoryController.deleteCategory);

module.exports = Router;