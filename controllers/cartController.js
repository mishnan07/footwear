const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const bcrypt = require('bcrypt');
const { name } = require('ejs');
const { rawListeners } = require('../models/userModel');

let message = null
let success = null


const update = async (req, res) => {
  try {

    const userID = req.session.user_id;

    const id = req.body.productId
    const action = req.body.a
    const prices = parseInt(req.body.prices)
    const grandTotal = parseInt(req.body.grandTotal);
    const quantity = parseInt(req.body.quantityInput);
    let newPrice;
    if (action == 1) {

      const productData = await Product.findOne({ _id: id })

      const updatedQuantity = quantity + 1;

      if (productData.stock < updatedQuantity) {
        const msg = "Out Of Stock"

        res.status(200).send({
          msg: msg
        })
      } else {

        const updatedprs = prices * quantity;
        newPrice = prices * updatedQuantity;
        const updatedSub = grandTotal - updatedprs + newPrice;
        const cartData = await Cart.findOne({ userId: userID })
        const total = await Cart.updateOne({ userId: userID, "item.product": id }, { $set: { "item.$.total": newPrice, "item.$.quantity": updatedQuantity, grandTotal: updatedSub } })



        res.status(200).send({
          quantity: updatedQuantity,
          id: id,
          prices: newPrice,
          sub: updatedSub
        })
      }
    }
    else if (action == -1) {
      if (quantity == 1) {
        console.log('actoin -1=1' + quantity + 'id' + id);
        res.status(200).send({
          quantity,
          id: id,
          prices,
          sub: grandTotal
        })
      }
      else {

        const updatedprs = prices * quantity;
        const updatedQuantity = quantity - 1;
        newPrice = prices * updatedQuantity;
        const updatedSub = grandTotal - updatedprs + newPrice;
        console.log('actoin -1' + updatedQuantity + 'id' + id);
        const total = await Cart.updateOne({ userId: userID, "item.product": id }, { $set: { "item.$.total": newPrice, "item.$.quantity": updatedQuantity, grandTotal: updatedSub } })

        res.status(200).send({
          quantity: updatedQuantity,
          id: id,
          prices: newPrice,
          sub: updatedSub
        })
      }
    }


  } catch (error) {
    console.log(error);
  }
}


const loadCart = async (req, res) => {
  try {
    const userID = req.session.user_id;
    const session = req.session.user_id;
    let sum = 0;
    console.log(userID);
    if (userID) {
      const productData = await Product.find({ is_unListed: false }).populate('category')

      const cartData = await Cart.findOne({ userId: userID }).populate('item.product');

      if (cartData) {
        const length = cartData.item.length;
        for (let i = 0; i < length; i++) {
          sum = sum + (cartData.item[i].product.price * cartData.item[i].quantity)
        }
      }
      res.render('cart', {products:productData, cartData, sum, userID, message, success, session });
      success = null

    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Error loading cart data');
  }
};



const addToCart = async (req, res) => {
  try {

    console.log(req.query);

    const userID = req.session.user_id;
    const productID = req.query.id
    const productData = await Product.findOne({ _id: productID })
    const cartData = await Cart.findOne({ userId: userID })

    const same = await Cart.findOne({ userId: userID, "item.product": productID })

    if (same) {

      const quantity = await Cart.updateOne(
        {
          userId: userID,
          'item.product': productID
        },
        {
          $inc: { 'item.$.quantity': 1 }
        })
      const cart = await Cart.findOne({
        userId: userID,
        'item.product': productID
      });
      const matchedItem = cart.item.find(item => item.product.toString() === productID.toString());
      const updatedQuantity = matchedItem.quantity;

      const Total = updatedQuantity * productData.price
      res.redirect('/cart')

      await Cart.updateOne(
        {
          userId: userID,
          'item.product': productID
        },
        {
          $set: { 'item.$.total': Total }
        })

    } else {



      const quantity = 1
      const total = quantity * productData.price

      if (cartData) {
        const updatecart = await Cart.updateOne({ userId: userID }, { $push: { item: [{ product: productData.id, quantity: quantity, total: total }] } })
        success = "successfully added to cart"
        res.redirect('/cart')

      } else {
        const insetcart = await Cart.insertMany({ userId: userID, item: [{ product: productData.id, quantity: quantity, total: productData.price }] })
        success = "successfully added to cart"
        res.redirect('/cart')
      }
      console.log();

    }
  } catch (error) {
    console.log(error.message);
  }
}





const RemoveCart = async (req, res) => {
  try {
    const userID = req.session.user_id;
    const itemID = req.query.id;
    const wait = await Cart.updateOne({ userId: userID }, { $pull: { item: { _id: itemID } } })
    res.redirect('/cart')
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadCart,
  addToCart,
  update,
  RemoveCart

}