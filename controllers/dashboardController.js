const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const bcrypt = require('bcrypt');
const { name } = require('ejs');
const { rawListeners } = require('../models/userModel');
const mongoose = require("mongoose");








const loadDashboard = async (req, res) => {
  try {
    let DailyEnd = new Date();
    let DailyStart = new Date(DailyEnd.getTime() - 86400000);

    let monthlyStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    let monthlyEnd = (DailyEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ));

    let yearlyStart = new Date(new Date().getFullYear(), 0, 1);
    let yearlyEnd = new Date(new Date().getFullYear(), 11, 31);

    let dailySalesData = await Order.find({
      status: "Order Delivered",
      delivered_date: {
        $gte: DailyStart,
        $lte: DailyEnd,
      },
    })
      .populate("userId")
      .populate("item.product");



    const dailySales = dailySalesData.reduce((total, order) => {
      const itemTotal = order.item.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return total + itemTotal;
    }, 0);



    const dailySalesDocument = await Order.find({
      status: "Order Delivered",
      delivered_date: {
        $gte: DailyStart,
        $lte: DailyEnd,
      },
    })
      .populate("userId")
      .populate("item.product")
      .countDocuments();



    const dailySalesProduct = dailySalesData.reduce((total, order) => {
      const orderProductsCount = order.item.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return total + orderProductsCount;
    }, 0);

    let monthlySalesData = await Order.find({
      status: "Order Delivered",
      delivered_date: {
        $gte: monthlyStart,
        $lte: monthlyEnd,
      },
    })
      .populate("userId")
      .populate("item.product");



    const monthlySales = monthlySalesData.reduce((total, order) => {
      const itemTotal = order.item.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return total + itemTotal;
    }, 0);

    const monthlySaleDocument = await Order.find({
      status: "Order Delivered",
      delivered_date: {
        $gte: monthlyStart,
        $lte: monthlyEnd,
      },
    })
      .populate("userId")
      .populate("item.product")
      .countDocuments();

    const monthlySalesProduct = monthlySalesData.reduce((total, order) => {
      const orderProductsCount = order.item.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return total + orderProductsCount;
    }, 0);

    let yearlySalesData = await Order.find({
      status: "Order Delivered",
      delivered_date: {
        $gte: yearlyStart,
        $lte: yearlyEnd,
      },
    })
      .populate("userId")
      .populate("item.product");

    const yearlySalesProduct = yearlySalesData.reduce((total, order) => {
      const orderProductsCount = order.item.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return total + orderProductsCount;
    }, 0);

    const yearlySaleDocument = await Order.find({
      status: "Order Delivered",
      delivered_date: {
        $gte: yearlyStart,
        $lte: yearlyEnd,
      },
    })
      .populate("userId")
      .populate("item.product")
      .countDocuments();

    const yearlySales = yearlySalesData.reduce((total, order) => {
      const itemTotal = order.item.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return total + itemTotal;
    }, 0);

    const startDate = req.query.start_date
      ? new Date(req.query.start_date)
      : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : null;
    if (endDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    let query = { status: "Order Delivered", };
    if (startDate && endDate) {
      query.delivered_date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.delivered_date = { $gte: startDate };
    } else if (endDate) {
      query.delivered_date = { $lte: endDate };
    }
    const salesData = await Order.find(query).populate("userId").populate('item.product');
    let totalAmount = 0;
    for (i = 0; i < salesData.length; i++) {
      totalAmount += parseInt(salesData[i].allTotal);
    }

    const monthlySalesDetails = [];
    for (let i = 0; i < 12; i++) {
      const salesOfMonth = yearlySalesData.filter((order) => {
        return order.delivered_date.getMonth() === i;
      });

      const totalSalesOfMonth = salesOfMonth.reduce((total, order) => {
        return (
          total +
          order.item.reduce((sum, item) => {
            return sum + item.price * item.quantity;
          }, 0)
        );
      }, 0);

      monthlySalesDetails.push(totalSalesOfMonth);
    }


    const allMonthsUser = [...Array(12).keys()].map((m) => m + 1);

    let monthlyOrderCounts = allMonthsUser.reduce((acc, cur) => {
      acc[cur - 1] = 0;
      return acc;
    }, []);

    yearlySalesData.forEach((order) => {
      let deliveredDate = new Date(order.delivered_date);
      let month = deliveredDate.getMonth() + 1;
      monthlyOrderCounts[month - 1]++;
    });





    const allMonthsProduct = [...Array(12).keys()].map((m) => m + 1);

    let monthlyProductCounts = allMonthsProduct.reduce((acc, cur) => {
      acc[cur - 1] = 0;
      return acc;
    }, []);

    yearlySalesData.forEach((order) => {
      let deliveredDate = new Date(order.delivered_date);
      let month = deliveredDate.getMonth() + 1;
      order.item.forEach((item) => {
        monthlyProductCounts[month - 1] += item.quantity;
      });
    });








    console.log(monthlySalesDetails + monthlyOrderCounts + monthlyProductCounts);

    res.render("home", {
      dailySales,
      monthlySales,
      monthlySaleDocument,
      dailySalesProduct,
      monthlySalesProduct,
      dailySalesDocument,
      yearlySales,
      yearlySaleDocument,
      yearlySalesProduct,
      data: salesData,
      totalAmount,
      monthlySalesDetails: JSON.stringify(monthlySalesDetails),
      monthlyOrderCounts: JSON.stringify(monthlyOrderCounts),
      monthlyProductCounts: JSON.stringify(monthlyProductCounts),
    });
  } catch (error) {
    console.log(error.message);
  }
};






module.exports = {
  loadDashboard
}