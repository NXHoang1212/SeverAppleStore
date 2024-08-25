const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const io = require('socket.io')
const path = require('path');

//error middleware
const ErrorMiddleware = require('./middleware/Error.middleware');
const CreateError = require('http-errors');

//database
const databse = require('./database/Db');

//router
const authRouter = require('./router/Auth.Router');
const productRouter = require('./router/Product.Route');
const categoryRouter = require('./router/Catgories.Router');
const bannerRouter = require('./router/Banner.Router');
const addressRouter = require('./router/Address.Router')
const favouritesRouter = require('./router/Favourites.Router');
const cartRouter = require('./router/Cart.Router')
const voucherRouter = require('./router/Voucher.Router')
const orderRouter = require('./router/Order.Router')
const notificationRouter = require('./router/Notification.Router')

//env
require('dotenv').config();

const app = express();
const server = createServer(app);
const socket = io(server);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/address', addressRouter);
app.use('/api/favourites', favouritesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/voucher', voucherRouter);
app.use('/api/order', orderRouter);
app.use('/api/notifee', notificationRouter);


databse.connect();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use((req, res, next) => {
    next(CreateError(404, '🚀 Not Found 🚀'));
});

server.listen(process.env.PORT, (error) => {
    if (error) {
        console.log('🚀 Error running the server ');
    }
    console.log(`🚀 ~ Server is running on port ~ ${process.env.PORT} 🚀`);
});

//Error Middleware
app.use(ErrorMiddleware);

// const { JWT } = require('google-auth-library');
// const axios = require('axios');
// const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

// function getAccessToken() {
//     return new Promise(function (resolve, reject) {
//         const key = require('../json/service-account.json');
//         const jwtClient = new JWT(
//             key.client_email,
//             null,
//             key.private_key,
//             SCOPES,
//             null
//         );
        
//         jwtClient.authorize(function (err, tokens) {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             resolve(tokens.access_token);
//             console.log('Access Token:', tokens.access_token);
//         });
//     });
// }

// const token = getAccessToken();
