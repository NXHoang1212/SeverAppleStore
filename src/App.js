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
// 6e4430eb19543df2a9a077ca1198141b908fe8d4   7fc68b0c88e21b03e2fb38a43cb0c08e2a1545b6

