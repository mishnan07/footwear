const userSchema = require('../models/userModel');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const cartController = require('../controllers/cartController');
const Rate = require('../models/rateModel');
const Count = require('../models/countModel');
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel');
const mongoose = require('mongoose');



const bannerLoad = async (req, res) => {
    try {
        const banner = await Banner.find({})
        res.render('banner', { banner: banner });
    } catch (error) {
        console.log(error.message);
    }
}


const addBannerLoad = async (req, res) => {
    try {
        res.render('addBanner');
    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async (req, res) => {
    try {
        let images = []
        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                images[i] = req.files[i].filename
            }
        }


        const banner = new Banner({
            image: images,
            mainHeading: req.body.title,
            description: req.body.description

        });
        await banner.save();
        res.redirect('/admin/banner');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error')
    }
}


const editBannerLoad = async (req, res) => {
    try {
        const id = req.query.id
        console.log(id, 'iidd');
        const banner = await Banner.findOne({ _id: id })
        console.log(banner);
        res.render('editBanner', { banner: banner, id1: id })
    } catch (error) {
        console.log(error.message);
    }
}

const editBanner = async (req, res) => {
    try {
        let images = []
        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images[i] = req.files[i].filename
            }
        }
        const id = req.query.id
        const banner = await Banner.findOne({ _id: id })


        await Banner.findByIdAndUpdate({ _id: id },
            {
                image: images,
                mainHeading: req.body.title,
                description: req.body.description
            }
        )
        res.redirect('/admin/banner');

    } catch (error) {
        console.log(error.message);
    }
}

const deleteBanner = async (req, res) => {
    try {
        const id = req.query.id
        await Banner.findByIdAndDelete({ _id: id })
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}

const unListBanner = async(req,res)=>{
    try {
        const id = req.params.id
        const bannerData = await Banner.findOne({ _id: id }, { is_unListed: 1 })
    if (bannerData.is_unListed == false) {
      const wait = await Banner.updateOne({ _id: id }, { $set: { is_unListed: true } })
      res.redirect('/admin/banner')
    } else {
      const wait = await Banner.updateOne({ _id: id }, { $set: { is_unListed: false } })
      res.redirect('/admin/banner');
    }
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {

    bannerLoad,
    addBannerLoad,
    addBanner,
    editBannerLoad,
    editBanner,
    deleteBanner,
    unListBanner
}