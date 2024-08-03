const Router = require('express').Router();
const CartController = require('../controller/Cart.Controller');

Router.post('/addCart', CartController.createCart);

Router.get('/getCartId/:id', CartController.getCartById);

Router.put('/updateCart/:id', CartController.updateCart);

Router.delete('/deleteCart/:id', CartController.deleteCart);

Router.get('/getCartUserId/:user', CartController.getCartByUser);

Router.post('/getCartsIds', CartController.getCartsIds);

Router.put('/updateStatus', CartController.updateCartStatusIds);

Router.put('/updateStatusRemove/:id', CartController.updateCartStatusRemove);

module.exports = Router;