const Router = require('express').Router();

const EvaluateController = require('../controller/Evaluate.Controller');

const { uploadMulterMedia } = require('../middleware/UploadFormAws');


Router.post('/create', uploadMulterMedia, EvaluateController.createEvaluate);

Router.get('/get/order/:order_id', EvaluateController.getEvaluateByOrderId);

Router.get('/get/user/:user_id', EvaluateController.getEvaluateByUserId);

Router.get('/get/admin/allEvaluate', EvaluateController.getEvaluateAll);

Router.put('/update/:id', uploadMulterMedia, EvaluateController.updateEvaluate);

Router.get('/detail/:id', EvaluateController.detailEvaluate);


module.exports = Router;