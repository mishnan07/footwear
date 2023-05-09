const express = require('express');

const admin_route = express();
const nocache = require('nocache');

const session = require('express-session');

require('dotenv').config();
const oneDay = 1000 * 60 * 60 * 24;
admin_route.use(session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

admin_route.use(nocache())


const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

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

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

const auth = require('../middleware/adminAuth');

const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const bannerController = require('../controllers/bannerController');
const dashboardController = require('../controllers/dashboardController');


admin_route.get("/dashboard", dashboardController.loadDashboard);



admin_route.get('/', auth.isLogout, adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);

admin_route.get('/home', auth.isLogin, dashboardController.loadDashboard);

admin_route.get('/listUser', auth.isLogin, adminController.loadlistUser);
admin_route.get('/block-user/:id', auth.isLogin, adminController.blockUser);

admin_route.get('/category', auth.isLogin, categoryController.loadCategory)
admin_route.get('/new-category', auth.isLogin, categoryController.loadAddCategory)
admin_route.post('/new-category', auth.isLogin, categoryController.addCategory)
admin_route.get('/edit-category', auth.isLogin, categoryController.loadEditCategory)
admin_route.post('/edit-category', auth.isLogin, categoryController.editCategory)
admin_route.get('/delete-category', auth.isLogin, categoryController.deleteCategory)

admin_route.get('/products', auth.isLogin, productController.loadProducts);
admin_route.get('/add-products', auth.isLogin, productController.loadAddProducts);
admin_route.post('/add-products', auth.isLogin, upload.array('image'), productController.addProduct);
admin_route.get('/edit-products/:id', auth.isLogin, productController.loadEditProduct);
admin_route.post('/edit-products', auth.isLogin, upload.array('image'), productController.editProduct);
admin_route.get('/unList-product/:id', auth.isLogin, productController.unListProduct);
admin_route.get('/image-remove', auth.isLogin, productController.productsimagremove);
admin_route.get("/deletImage", auth.isLogin, productController.deleteImage);


admin_route.get('/orderList', auth.isLogin, orderController.orderList);
admin_route.get('/orderDetails', auth.isLogin, orderController.orderDetailsAdmin);
admin_route.post('/orderShipped', auth.isLogin, orderController.orderShipped);
admin_route.post('/orderDelivered', auth.isLogin, orderController.orderDelivered);
admin_route.post('/acceptReturn', auth.isLogin, orderController.acceptReturn);

admin_route.get('/coupon', auth.isLogin, couponController.couponLoad);
admin_route.get('/addCoupon', auth.isLogin, couponController.addCouponLoad);
admin_route.post('/addCoupon', auth.isLogin, couponController.addCoupon);
admin_route.get('/blockCoupon/:id', auth.isLogin, couponController.blockCoupon);
admin_route.get('/editCoupon/:id',auth.isLogin, couponController.editCouponLoad);
admin_route.post('/editCoupon',auth.isLogin, couponController.editCoupon);


admin_route.get('/banner',auth.isLogin, bannerController.bannerLoad);
admin_route.get('/addBanner',auth.isLogin, bannerController.addBannerLoad);
admin_route.post('/addBanner',auth.isLogin, upload.array('image'), bannerController.addBanner);
admin_route.get('/editBanner',auth.isLogin, upload.array('image'), bannerController.editBannerLoad);
admin_route.post('/editBanner',auth.isLogin, upload.array('image'), bannerController.editBanner);
admin_route.get('/deleteBanner',auth.isLogin, bannerController.deleteBanner);
admin_route.get('/unList-banner/:id', auth.isLogin, bannerController.unListBanner);



admin_route.get('/filterDate',auth.isLogin, adminController.filterDate)




admin_route.get('/logout', auth.isLogin, adminController.logout);


admin_route.get('*', function (req, res) {

    res.redirect('/admin');

})


module.exports = admin_route;






