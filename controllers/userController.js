const userSchema = require('../models/userModel');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const cartController = require('../controllers/cartController')
const Rate = require('../models/rateModel');
const Count = require('../models/countModel');
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel');

const mongoose = require('mongoose');

const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const session = require('express-session')
const { name } = require('ejs');




const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}





const loadHome = async (req, res) => {
    try {
        const session = req.session.user_id;

        const banner = await Banner.find({is_unListed:false})
        const productData = await Product.find({ is_unListed: false }).populate('category')
        res.render('home', { products: productData, session, banner: banner });
        success = null
    } catch (error) {
        console.log(error.message);

    }
}

const productDetail = async (req, res) => {
    try {
        const session = req.session.user_id;

        const productID = req.query.id
        const id = mongoose.Types.ObjectId(productID);
        const rate = await Rate.find({ product: id })
        // 
        const userId = rate.map((item) => {
            return item.userId
        });


        const userData = await userSchema.find({ _id: { $in: userId } }, { name: 1, _id: 0 });




        // Combine products with quantities
        const combined = rate.map((p, i) => ({ ...p.toObject(), name: userData[i].name }));
        // 
        let avg
        const count = await Count.findOne({ product: id })
        if (count) {
            let one = count.countOne;
            one = one * 1;
            let two = count.countTwo;
            two = two * 2
            let three = count.countThree;
            three = three * 3
            let four = count.countFour;
            four = four * 3
            let five = count.countFive;
            five = five * 5
            avg = (one + two + three + four + five) / 5
            console.log(avg);
        }

        const ProductDetails = await Product.findOne({ _id: productID })
        res.render('productDetail', { ProductDetails, session, combined, count, avg })
    } catch (error) {
        console.log(error.message);
    }
}


const userLogout = async (req, res) => {
    try {

        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);

    }
}




const loadRegister = async (req, res) => {
    try {
        res.render('registration');

    } catch (error) {
        console.log(error.message);
    }
}


const insertUser = async (req, res) => {

    try {
        const testMail = req.body.email
        const spassword = await securePassword(req.body.password);
        const EMAILsame= await userSchema.findOne({email:testMail})

    if(EMAILsame){     
            res.render('registration', { message: 'email already exist' });
            
}else{
        const user = new userSchema({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            otp: Math.floor(100000 + Math.random() * 900000),
            is_admin: 0
        });
        const userData = await user.save();

        if (userData) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'thymadatesandnuts@gmail.com',
                    pass: 'lelzandsawrjzxhb'
                }
            });
            const mailOptions = {
                from: 'thymadatesandnuts@gmail.com',
                to: req.body.email,
                subject: 'OTP Verification',
                text: `Your OTP for verification is ${userData.otp}`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.send('Error sending OTP. Please try again.');
                } else {
                    res.render('verification');
                }
            })
            res.render('verification', { message: 'your registration has been sucessfully,please verify your mail' });
        }
        else {
            res.render('registration', { message: 'your registration has been failed' });
        }
    }
        

    } catch (error) {
        console.log(error.message);

    }
}

const otpVerification = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp;
        const otpData = await userSchema.find({ email: email, otp: otp })
        const check = otpData[0].otp;

        if (otp == check) {
            otpData[0].is_verified = 1
            await otpData[0].save();
            const emailUser = otpData[0].name;

            req.session.user_id = otpData[0]._id;

            res.redirect('/home')
        }
        else {
            res.render('verification');
        }
    } catch (error) {
        console.log(error.message);
    }

}





//Login user methodes started

const loginLoad = async (req, res) => {
    try {
        res.render('login')

    } catch (error) {
        console.log(error.message);
    }

}


const verifyLogin = async (req, res) => {

    try {
        const Email = req.body.email;
        const password = req.body.password;
        const blockedUser = await userSchema.findOne({ email: Email, is_blocked: true })
        const userData = await userSchema.findOne({ email: Email, is_blocked: false });
        console.log(blockedUser);

        if (blockedUser) {
            res.render('login', { message: 'your account already blocked' })

        }
        else if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                req.session.user_id = userData._id;
                res.redirect('/home');
            }
            else {
                res.render('login', { message: ' Password incorrect' })
            }
        }
        else {

            res.render('login', { message: 'please provide a valid Email ' })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const loadProfile = async (req, res) => {
    try {
        let addressData
        const id = req.session.user_id;
        console.log(id + 'USER NAME');
        const userSearchForVerify = await userSchema.findOne({ _id: id, is_verified: 1 })
        console.log(userSearchForVerify);
        const name = userSearchForVerify.name;
        const email = userSearchForVerify.email;
        const mobile = userSearchForVerify.mobile;
        const image = userSearchForVerify.image;

        const userData = await userSchema.findOne({ _id: id });
        const address = userData.address[0];
        if (address) {
            const str = address.street;
            const cty = address.city;
            const ste = address.state;
            const zip = address.zipCode;
            addressData = str + cty + ste + zip;
        }
        addressData = '';

        res.render('profile', { name, email, mobile, image, userSearchForVerify, session: id, addressData });

    } catch (error) {
        console.log(error.message);
    }
}

const editProfile = async (req, res) => {
    try {
        const id = req.session.user_id;
        const userData = await userSchema.findOne({ _id: id });

        let images = []
        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images[i] = req.files[i].filename
            }
        } else {
            images = userData.image
        }

        const image = images
        const name = req.body.NAME
        const email = req.body.EMAIL
        const mobile = req.body.MOBILE
        const address = req.body.address

        const updateprofile = await userSchema.updateOne({ _id: id }, { name: name, email: email, mobile: mobile, "address": address, image: image })

        console.log(updateprofile);

        res.redirect('/profile')
    } catch (error) {
        console.log(error.message);
    }
}


const editPassword = async (req, res) => {
    try {
        const id = req.session.user_id;
        const userData = await userSchema.findOne({ _id: id });


    } catch (error) {
        console.log(error.message);
    }
}
const addAddress = async (req, res) => {
    try {
        
        const id = req.session.user_id;
        const street = req.body.street;
        const city = req.body.city;
        const state = req.body.state;
        const zipCode = req.body.zipCode;
        const updateaddress = await userSchema.findByIdAndUpdate(
            { _id: id },
            { $push: { address: [{ street: street, city: city, state: state, zipCode: zipCode }] } }
        );
        const userData = await userSchema.findOne({ _id: id });
        const address = userData.address[0];
        const str = address.street;
        const cty = address.city;
        const ste = address.state;
        const zip = address.zipCode;
        const arr = str + cty + ste + zip;

        res.redirect("/profile");
    } catch (error) {
        console.log(error.message);
    }
};

const loadwishList = async (req, res) => {
    try {

        const userID = req.session.user_id;
        if (userID) {
            const productData = await Product.find({ is_unListed: false }).populate('category')

            const WishlistData = await Wishlist.findOne({ userId: userID }).populate('item.product');

            res.render('wishList', {products: productData, WishlistData, session: userID })

        } else {
            res.redirect('/login')
        }


    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading whishlist data');

    }

}

const addTowishList = async (req, res) => {
    try {
        const userID = req.session.user_id;
        const productID = req.query.id
        const productData = await Product.findOne({ _id: productID })
        const WishlistData = await Wishlist.findOne({ userId: userID })
        const sameWishlistData = await Wishlist.findOne({ userId: userID,"item.product": productID })
        if(!sameWishlistData){
        if (WishlistData) {
             const updatecart = await Wishlist.updateOne({ userId: userID }, { $push: { item: [{ product: productData.id }] } })
            res.redirect('/wishList');

        } else {
            console.log("insert new");
            const insetcart = await Wishlist.insertMany({ userId: userID, item: [{ product: productData.id }] })
            res.redirect('/wishList')
        }
    }else{
        res.redirect('/wishList');

    }
    } catch (error) {
        console.log(error.message);

    }
}

const removeWishlist = async (req, res) => {
    try {
        const userID = req.session.user_id;
        const itemID = req.query.id;
        const wait = await Wishlist.updateOne({ userId: userID }, { $pull: { item: { _id: itemID } } })

        res.redirect('/wishList')

    } catch (error) {
        console.log(error.message);
    }
}

const checkout = async (req, res) => {
    try {
        const userID = req.session.user_id;
        const userData = await userSchema.findOne({ _id: userID })

        const cartData = await Cart.findOne({ userId: userID }).populate('item.product');
        if(cartData.item[0]!=null){
        const length = cartData.item.length;
        let sum = 0;
        for (let i = 0; i < length; i++) {
            sum = sum + (cartData.item[i].product.price * cartData.item[i].quantity)

            console.log(sum);
        }
        const arr = []
        const size = userData.address.length;
        for (i = 0; i < size; i++) {
            const address = userData.address[i];
            const str = address.street;
            const cty = address.city;
            const ste = address.state;
            const zip = address.zipCode;
            arr[i] = str + cty + ste + zip;
        }

        const couponData = await Coupon.find({status:false})
        res.render('checkout', { userData, arr, cartData, sum, session: userID, couponData });
    }else{
        res.redirect('/home');
    }
    } catch (error) {
        console.log(error.message);
    }
}


const addAddressChekout = async (req, res) => {
    try {
        const id = req.session.user_id;
        const street = req.query.street;
        const city = req.query.city;
        const state = req.query.state;
        const zipCode = req.query.zipCode;
        const updateaddress = await userSchema.findByIdAndUpdate(
            { _id: id },
            { $push: { address: [{ street: street, city: city, state: state, zipCode: zipCode }] } }
        );


        res.status(200).send({
            street: street,
            city: city,
            state: state,
            zipCode: zipCode
        })
    } catch (error) {
        console.log(error.message);
    }
}



//shop-------------------------

const shopLoad = async (req, res) => {
    try {

        const category = await Category.find({})
        console.log(category);
        const productData = await Product.find({})
        const userID = req.session.user_id;

        res.render('shop', { session: userID, productData, category });

    } catch (error) {
        console.log(error.message);
    }
}

const filterCategory = async (req, res) => {
    try {
        const userID = req.session.user_id;
        const category = await Category.find({})

        console.log(req.query);
        const id = req.query.id
        const productData = await Product.find({ category: id })



        res.render('shop', { productData, session: userID, category })
    } catch (error) {
        console.log(error.message);
    }
}






module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    productDetail,
    otpVerification,
    loadProfile,
    editProfile,
    editPassword,
    addAddress,
    loadwishList,
    addTowishList,
    removeWishlist,
    checkout,
    shopLoad,
    filterCategory,
    addAddressChekout





}