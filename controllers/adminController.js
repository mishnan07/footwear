const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const bcrypt = require('bcrypt');
const { name } = require('ejs');
const { rawListeners } = require('../models/userModel');
const mongoose = require("mongoose");


let message

const middleware = async (req, res, next) => {
    next();
}

const securePassword = async (password) => {
    try {

        const passwordMatch = await bcrypt.hash(password, 10);
        return passwordMatch;

    } catch (error) {
        console.log(error.message);
    }
}


const loadLogin = async (req, res) => {

    try {

        res.render('loginadmin');

    } catch (error) {
        console.log(error.message);

    }
}


const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;


        const userData = await User.findOne({ email: email });
        console.log(userData);



        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {

                if (userData.is_admin == 0) {
                    res.render('loginadmin', { message: "email and password is incorrect for admin" });
                }

                else {
                    req.session.admin_id = userData._id;
                    res.redirect("/admin/home");
                }
            }
            else {
                res.render('loginadmin', { message: "password is incorrect" });
            }
        }
        else {
            res.render('loginadmin', { message: "please provide your correct email " });
        }
    } catch (error) {
        console.log(error.message);
    }
}






const filterDate = async (req, res) => {
    try {

        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);

        const orders = await Order.find({
            status: "Order Delivered",
            delivered_date
                : {
                $gte: startDate,
                $lte: endDate,
            },
        });

        const orderData = await Order.find({ status: "Order Delivered" }).populate('userId')
        let sum = 0

        for (let i = 0; i < orderData.length; i++) {
            sum = sum + parseInt(orderData[i].allTotal)
        }
        const Uid = mongoose.Types.ObjectId(orderData.userId);
        const user = await User.find({})
        const usersid = await Order.find({}, { userId: 1 });
        const distinctUserIds = await Order.distinct("userId");
        const userCount = distinctUserIds.length;


        console.log(orders);

        res.render('home', { orderData: orders, sum, userCount })

    } catch (error) {
        console.log(error.message);
    }
}




const loadlistUser = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search
        }
        const userdata = await User.find({
            $or: [
                { name: { $regex: '.*' + search + '.*' } },
                { email: { $regex: '.*' + search + '.*' } }
            ]
        })
        res.render('listUser', { users: userdata })
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async (req, res) => {
    try {
        const id = req.params.id
        const userdata = await User.findOne({ _id: id }, { is_blocked: 1 })
        if (userdata.is_blocked == false) {
            const wait = await User.updateOne({ _id: id }, { $set: { is_blocked: true } })
            req.session.user_id = false
            res.redirect('/admin/listUser');
        } else {
            const wait = await User.updateOne({ _id: id }, { $set: { is_blocked: false } })
            req.session.user_id = false
            res.redirect('/admin/listUser');
        }

    } catch (error) {
        console.log(error.message);
    }
}



const logout = async (req, res) => {
    try {

        req.session.destroy();
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);

    }
}




module.exports = {
    loadLogin,
    verifyLogin,
    logout,
    loadlistUser,
    blockUser,
    middleware,
    filterDate

}