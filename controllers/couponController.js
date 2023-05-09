const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const bcrypt = require('bcrypt');
const { name } = require('ejs');
const { rawListeners } = require('../models/userModel');
const { query } = require('express');





const couponLoad = async (req, res) => {
  try {
    const couponData = await Coupon.find()
    console.log(couponData);
    res.render('coupon', { couponData })
  } catch (error) {
    console.log(error.message);
  }
}

const addCouponLoad = async (req, res) => {
  try {
    res.render('addCoupon')
  } catch (error) {
    console.log(error.message);
  }
}

const addCoupon = async (req, res) => {
  try {
    const coupon = new Coupon({
      couponName: req.body.couponName,
      couponCode: req.body.couponCode,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      minAmount: req.body.minAmount,
      minDiscount: req.body.minDiscount,
      maxDiscount: req.body.maxDiscount,
    })
    await coupon.save();
    res.redirect('/admin/coupon')
  } catch (error) {
    console.log(error.message);
  }
}

const blockCoupon = async (req, res) => {
  try {
    const id = req.params.id
    const couponData = await Coupon.findOne({ _id: id }, { status: 1 });
    if (couponData.status == false) {
      const wait = await Coupon.updateOne({ _id: id }, { $set: { status: true } })
      res.redirect('/admin/coupon');
    } else {
      const wait = await Coupon.updateOne({ _id: id }, { $set: { status: false } })
      res.redirect('/admin/coupon');
    }
  } catch (error) {
    console.log(error.message);
  }
}


const editCouponLoad = async (req, res) => {
  try {
    console.log(req.params, 'yyyyyy');
    const id = req.params.id
    const couponData = await Coupon.findOne({ _id: id })
    res.render('editCoupon', { couponData, id });
  } catch (error) {
    console.log(error, message);
  }
}


const editCoupon = async (req, res) => {
  try {
    const id = req.body.id
    const couponName = req.body.couponName
    const couponCode = req.body.couponCode
    const startDate = req.body.startDate
    const endDate = req.body.endDate
    const minAmount = req.body.minAmount
    const minDiscount = req.body.minDiscount
    const maxDiscount = req.body.maxDiscount

    await Coupon.findOneAndUpdate({ _id: id },
      {
        couponName: couponName,
        couponCode: couponCode,
        startDate: startDate,
        endDate: endDate,
        minAmount: minAmount,
        minDiscount: minDiscount,
        maxDiscount: maxDiscount,
      }
    )
    res.redirect('/admin/coupon');

  } catch (error) {

  }
}




// user side ///////////////////////////////////////////

const applyCoupon = async (req, res) => {
  try {
    const userID = req.session.user_id;
    const cart = await Cart.findOne({ userId: userID });
    const code = req.query.coupon;

    const couponData = await Coupon.find({ couponCode: code });
    const UserSearch = await Coupon.findOne({ user: userID, couponCode: code });
    if (UserSearch) {
      //   message pass
      const message = "Already used this coupon";
      res.status(200).send({
        message: message,
      });
    } else {
      if (couponData.length > 0) {
        console.log(couponData, "..........");

        const minDiscount = couponData[0].minDiscount;
        const grandTotal = req.query.grandTotal;

        let discount = Number((grandTotal * minDiscount) / 100);
        let allTotal = Number(grandTotal - discount);


        const minAmount = couponData[0].minAmount;
        if (grandTotal >= minAmount) {
          const maxDiscount = couponData[0].maxDiscount;
          if (discount > maxDiscount) {
            discount = maxDiscount;
            allTotal = Number(grandTotal - discount);
          }
          const AddUser = await Coupon.findOne({ couponCode: code });
          AddUser.user.push(userID);
          await AddUser.save();


          res.status(200).send({
            discount: discount,
            allTotal: allTotal,
          });
        } else {
          const message = `Minimum purchase amount ${minAmount} is required to apply this code`;
          res.status(200).send({
            message: message,
          });
        }
      } else {
        console.log('.....................................................');
        const message = `Coupon code ${code} is invalid`;
        res.status(200).send({
          message: message,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};







module.exports = {
  couponLoad,
  addCouponLoad,
  addCoupon,
  blockCoupon,
  applyCoupon,
  editCouponLoad,
  editCoupon

}