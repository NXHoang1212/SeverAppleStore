const Router = require('express').Router();
const CateogoryController = require('../controller/Categories.Controller');
const { uploadMulterSingle } = require('../middleware/UploadFormAws');

Router.post('/create', uploadMulterSingle, CateogoryController.createCategory);

Router.get('/get-all', CateogoryController.getAllCategory);

Router.get('/detail/:id', CateogoryController.getCategoryById);

Router.put('/update/:id', uploadMulterSingle, CateogoryController.updateCategory);

Router.delete('/delete/:id', CateogoryController.deleteCategory);

module.exports = Router;