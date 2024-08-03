const Router = require('express').Router();
const favouritesController = require('../controller/Favourites.Controller');

Router.post('/add', favouritesController.addToFavourites);

Router.get('/get', favouritesController.getFavourites);

Router.delete('/remove/:id', favouritesController.removeFromFavourites);
    
module.exports = Router