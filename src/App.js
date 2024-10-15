const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const socketServer = require('./middleware/SocketIO.middleware');

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
const evaluateRouter = require('./router/Evaluate.Router')

//env
require('dotenv').config();

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());
app.use(helmet());
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
app.use('/api/evaluate', evaluateRouter);


databse.connect();

app.use((req, res, next) => {
    next(CreateError(404, '🚀 Not Found 🚀'));
});

server.listen(process.env.PORT, (error) => {
    if (error) {
        console.log('🚀 Error running the server ');
    }
    console.log(`🚀 ~ Server is running on port ~ ${process.env.PORT} 🚀`);
});

const socketPort = process.env.SOCKET_PORT || 5000;

socketServer(socketPort);

console.log(`🚀 ~ Socket server is running on port ~ ${socketPort} 🚀`);

//Error Middleware
app.use(ErrorMiddleware);

