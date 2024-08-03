const Router = require('express').Router();
const addressController = require('../controller/Address.Controller')

Router.post('/create', addressController.createAddress);

Router.get('/getIdUser/:user_id', addressController.getAddressUserid);

Router.get('/getById/:id', addressController.getAddressById);

Router.put('/update/:id', addressController.updateAddress);

Router.delete('/delete/:id', addressController.deleteAddress);



module.exports = Router;