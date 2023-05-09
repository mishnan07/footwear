const express = require('express');

const user_route = express();
const nocache = require('nocache')

const session = require('express-session');

require('dotenv').config();
const oneDay = 1000 * 60 * 60 * 24;
user_route.use(session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));


user_route.use(nocache());




const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images')

        );
    },
    filename: function (req, file, cb) {

        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


const auth = require('../middleware/auth');

user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');


const bodyparser = require('body-parser');
user_route.use(bodyparser.json());
user_route.use(bodyparser.urlencoded({ extended: true }));


const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const productController = require('../controllers/productController')


const admin_route = require('./adminRoute');
const { use } = require('./adminRoute');


user_route.get('/home', userController.loadHome);
user_route.get('/', userController.loadHome);

user_route.get('/productDetail', userController.productDetail);

user_route.get('/register', userController.loadRegister);
user_route.post('/register', userController.insertUser);
user_route.post('/verification', userController.otpVerification)

user_route.get('/login', auth.isLogout, userController.loginLoad);
user_route.post('/login', userController.verifyLogin);

user_route.get('/profile', auth.isLogin, userController.loadProfile);
user_route.post('/editProfile', auth.isLogin, upload.array('image'), userController.editProfile);
user_route.post('/editPassword', auth.isLogin, userController.editPassword);
user_route.post('/addAddress', auth.isLogin, userController.addAddress)

user_route.get("/cart", auth.isLogin, cartController.loadCart);
user_route.post('/addToCart', auth.isLogin, cartController.addToCart);
user_route.get('/addToCart', auth.isLogin, cartController.addToCart);
user_route.post('/cart', auth.isLogin, cartController.update);
user_route.get("/removeCart", auth.isLogin, cartController.RemoveCart);

user_route.get('/wishList', auth.isLogin, userController.loadwishList);
user_route.post('/addTowishList', auth.isLogin, userController.addTowishList);
user_route.get('/removeWishlist', auth.isLogin, userController.removeWishlist);
user_route.get('/checkout', auth.isLogin, userController.checkout);
user_route.post('/addAddressChekout', auth.isLogin, userController.addAddressChekout);

user_route.post('/placeOrder', auth.isLogin, orderController.placeOrder);
user_route.get('/myOrders', auth.isLogin, orderController.myOrders);
user_route.get('/orderDetails', auth.isLogin, orderController.orderDetails);
user_route.post('/oredrCancel', auth.isLogin, orderController.oredrCancel)
user_route.post('/orderReturn', auth.isLogin, orderController.orderReturn);

user_route.get('/shop', userController.shopLoad);
user_route.get('/filterCategory', userController.filterCategory);

user_route.get('/categoryFilter', productController.categoryFilter)



user_route.post('/applyCoupon', auth.isLogin, couponController.applyCoupon)
user_route.get('/logout', auth.isLogin, userController.userLogout);

user_route.get('/success', auth.isLogin, orderController.confirmPayment)

user_route.get('/feedback', auth.isLogin, orderController.feedbackLoad);
user_route.post('/feedback', auth.isLogin, orderController.feedback)



module.exports = user_route;