const userSchema = require('../models/userModel');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const Cart =require('../models/cartModel');
const Category = require('../models/categoryModel');
const Order =require('../models/orderModel');
const Rate =require('../models/rateModel');
const Count =require('../models/countModel');
const mongoose = require("mongoose");
const paypal = require("paypal-rest-sdk");

require('dotenv').config();
paypal.configure({
    mode: "sandbox",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  });
  


let message

const placeOrder = async(req,res)=>{
    try {
        const userID = req.session.user_id;

        const cart = await Cart.findOne({userId:userID})

        if(cart.item[0]==null){
            res.redirect('/home')
        }else{
        

        if(req.body.optradio==="Cash On Delivery" ){
 const allTotal = req.body.aTotal 
 const discount=req.body.offer 
const userID = req.session.user_id;
const userData  = await userSchema.findOne({_id:userID})


const cartData = await Cart.findOne({ userId: userID }).populate('item.product');
const add=req.body.address;
const orderItems = cartData.item.map((value)=>{
    return {
        product: value.product._id,
        price: value.product.price,
        quantity: value.quantity,
        total:value.total
    }
});

let today = new Date();
let nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);


const Address =userData.address

const length=cartData.item.length;
         let sum=0;
         for(let i=0;i<length;i++){price = 0
         sum=sum+( cartData.item[i].product.price*cartData.item[i].quantity)
         
         console.log(sum);

         }
const order = await Order({
    userId:userID,
    paymentType:req.body.optradio,
    item:orderItems,
    delivered_date:nextWeek,
    totalPrice:sum,
    address:userData.address

    
});
const wait = await order.save()
const orderID = wait._id

const updateTotal = await Order.updateOne({userId:userID,_id:wait._id},{$set:{allTotal:allTotal}})

const cart = await Cart.findOne({userId:userID})

const date = new Date();
const day = date.getDate().toString().padStart(2, '0');
const month = (date.getMonth() + 1).toString().padStart(2, '0'); // add 1 to month since it's zero-indexed
const year = date.getFullYear().toString();

const formattedDate = `${day}-${month}-${year}`;

    

        res.render('placeOrder',{userData,paymentType:req.body.optradio,formattedDate,sum,cartData,add,session:userID,allTotal,discount,orderID});
        cart.item = []
        cart.grandTotal = 0;
        await cart.save()


        }else if(req.body.optradio==="wallet" ){
            const allTotal = req.body.aTotal 
            const discount=req.body.offer 
           const userID = req.session.user_id;
           const userData  = await userSchema.findOne({_id:userID})
           
           
           const cartData = await Cart.findOne({ userId: userID }).populate('item.product');
           const add=req.body.address;
           const orderItems = cartData.item.map((value)=>{
               return {
                   product: value.product._id,
                   price: value.product.price,
                   quantity: value.quantity,
                   total:value.total
               }
           });
           
           let today = new Date();
           let nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
           
           
           const Address =userData.address
           
           const length=cartData.item.length;
                    let sum=0;
                    for(let i=0;i<length;i++){price = 0
                    sum=sum+( cartData.item[i].product.price*cartData.item[i].quantity)
                    
                    console.log(sum);
           
                    }
           const order = await Order({
               userId:userID,
               paymentType:req.body.optradio,
               item:orderItems,
               delivered_date:nextWeek,
               totalPrice:sum,
               address:userData.address
           
               
           });
           const wait = await order.save()
           const orderID = wait._id
           
           const updateTotal = await Order.updateOne({userId:userID,_id:wait._id},{$set:{allTotal:allTotal}})
           
           
           const cart = await Cart.findOne({userId:userID})
           
           
           
           const date = new Date();
           const day = date.getDate().toString().padStart(2, '0');
           const month = (date.getMonth() + 1).toString().padStart(2, '0'); // add 1 to month since it's zero-indexed
           const year = date.getFullYear().toString();
           
           const formattedDate = `${day}-${month}-${year}`;


           const orderData = await Order.findOne({_id:orderID}).populate('userId')
            const UserID = orderData.userId._id
            const grandTotal = orderData.allTotal
             
            const wallet = orderData.userId.wallet
            const walletData =parseInt(wallet)-parseInt(grandTotal)
   
           const refund = await userSchema.updateOne({_id:UserID},{$set:{wallet:walletData}})
           
               
           
                   res.render('placeOrder',{userData,paymentType:req.body.optradio,formattedDate,sum,cartData,add,session:userID,allTotal,discount,orderID});
                   cart.item = []
                   cart.grandTotal = 0;
                   await cart.save()
             
        }
        
        else if(req.body.optradio==="Paypal" ){

            req.session.paymentType = "Paypal";
            req.session.discount = req.body.offer;
            req.session.allTotal = req.body.aTotal;
            const currencyMap = {
                840: "USD",
                978: "EUR",
                826: "GBP",
              };
              const currencyCode = currencyMap["840"];
        
              const amount = {
                currency: currencyCode,
                total:  req.session.allTotal,
              };
        
              
              const create_payment_json = {
                intent: "sale",
                payer: {
                  payment_method: "paypal",
                },
                redirect_urls: {
                  return_url:"http://localhost:5000/success",
                  cancel_url: "http://localhost:5000/checkout",
                },
                transactions: [
                  {
                    amount,
                    description: "New Fashion",
                  },
                ],
              };
        
              paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                  throw error;
                } else {
                  for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === "approval_url") {
                      res.redirect(payment.links[i].href);
                    }
                  }
                }
              });
        }
    }
    
    } catch (error) {
        console.log(error.message);
    }
}







const confirmPayment = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: req.session.allTotal,
          },
        },
      ],
    };
  
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
        
         const userID = req.session.user_id;
         const userData  = await userSchema.findOne({_id:userID})
         
         
         const cartData = await Cart.findOne({ userId: userID }).populate('item.product');
         const add=req.body.address;
         const orderItems = cartData.item.map((value)=>{
             return {
                 product: value.product._id,
                 price: value.product.price,
                 quantity: value.quantity,
                 total:value.total
             }
         });
         
         let today = new Date();
         let nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
         
         
         const Address =userData.address
         
         const length=cartData.item.length;
                  let sum=0;
                  for(let i=0;i<length;i++){price = 0
                  sum=sum+( cartData.item[i].product.price*cartData.item[i].quantity)
                  
                  console.log(sum);
         
                  }
         const order = await Order({
             userId:userID,
             paymentType:req.session.paymentType,
             item:orderItems,
             delivered_date:nextWeek,
             totalPrice:sum,
             address:userData.address
         
             
         });
         const wait = await order.save()
         console.log(wait._id)
         const orderID = wait._id
         
         const updateTotal = await Order.updateOne({userId:userID,_id:wait._id},{$set:{allTotal: req.session.allTotal}})
         
         
         const cart = await Cart.findOne({userId:userID})
         
         
         
         const date = new Date();
         const day = date.getDate().toString().padStart(2, '0');
         const month = (date.getMonth() + 1).toString().padStart(2, '0'); // add 1 to month since it's zero-indexed
         const year = date.getFullYear().toString();
         
         const formattedDate = `${day}-${month}-${year}`;
         
           
         
         res.render('placeOrder',{userData,paymentType:req.session.paymentType,formattedDate,sum,cartData,add,session:userID,allTotal: req.session.allTotal,discount:req.session.discount ,orderID});
         cart.item = []
                 cart.grandTotal = 0;
                 await cart.save()
        }
      }
    );
  };

const myOrders = async(req,res)=>{
    try {
        const userID = req.session.user_id;
        const productData = await Product.find({ is_unListed: false }).populate('category')

        const orderData = await Order.find({ userId: userID }).sort({ _id: -1 });
        res.render('myOrders',{products:productData,orderData,session:userID});
    } catch (error) {
        console.log(error.message);
    }
}

const orderDetails = async(req,res)=>{
    try {
        const id=req.query.id

        const userID = req.session.user_id;
        const  orderData = await Order.findOne({_id:id}).populate('item.product');
        const  userData =await userSchema.findOne({_id:userID})
        const L=Number(userData.address.length) 
        
        res.render('orderDetails',{orderData,userData,id,session:userID,L})
    } catch (error) {
        console.log(error.message);
    }
}


const oredrCancel =async(req,res)=>{
    try {
        const userID = req.session.user_id;
         const id = req.query.id
         
        const wait = await Order.updateOne({_id:id},{$set:{status:"Cancelled"}})
        const orderData = await Order.findOne({_id:id})
        if(orderData.paymentType==="Paypal"){
            const orderData = await Order.findOne({_id:id}).populate('userId')
            const userID = orderData.userId._id
            const grandTotal = orderData.allTotal
             
            const wallet = orderData.userId.wallet
            const walletData =Number(wallet)+Number(grandTotal)
   
           const refund = await userSchema.updateOne({_id:userID},{$set:{wallet:walletData}})
   

        }
        res.redirect(`/orderDetails?id=${id}`)
    } catch (error) {
        console.log(error.message);
    }
}


const orderReturn = async(req,res)=>{
    try {
        const userID = req.session.user_id;
         const id = req.query.id
         
        const wait = await Order.updateOne({_id:id},{$set:{status:"Return Request"}})
        res.redirect(`/orderDetails?id=${id}`)
        
    } catch (error) {
        console.log(error.message);
    }
}





//Admin side

const orderList = async(req,res)=>{
    try {
        const orderData = await Order.find({}).populate('userId').sort({ _id: -1 });
        console.log(orderData);
        res.render('orderList',{orderData});
    } catch (error) {
        console.log(error.message);
    }
}

const orderDetailsAdmin = async(req,res)=>{
    try {
        const id=req.query.id
        const orderData = await Order.findOne({_id:id}).populate('userId');
        const  productData = await Order.findOne({_id:id}).populate('item.product');

        res.render('orderDetails',{orderData,productData})
    } catch (error) {
        console.log(error.message);
    }
}


const orderShipped = async(req,res)=>{
    try {
        const id = req.query.id
        console.log(id);
        const wait = await Order.updateOne({_id:id},{$set:{status:"Order shipped"}})

        res.redirect(`/admin/orderDetails?id=${id}`)
    } catch (error) {
        console.log(error.message);
    }
}

const orderDelivered = async(req,res)=>{
    try {
        const id = req.query.id
        console.log(id);
        const wait = await Order.updateOne({_id:id},{$set:{status:"Order Delivered"}})

        res.redirect(`/admin/orderDetails?id=${id}`)
    } catch (error) {
        console.log(error.message);
    }
}

const acceptReturn = async(req,res)=>{
    try {
        const id = req.query.id
        const wait = await Order.updateOne({_id:id},{$set:{status:"Return Accepted"}})
         const orderData = await Order.findOne({_id:id}).populate('userId')
         const userID = orderData.userId._id
         const grandTotal = orderData.allTotal
          
         const wallet = orderData.userId.wallet
         const walletData =Number(wallet)+Number(grandTotal)

        const refund = await userSchema.updateOne({_id:userID},{$set:{wallet:walletData}})


        res.redirect(`/admin/orderDetails?id=${id}`)
        
    } catch (error) {
        console.log(error.message);
    }
}


const feedbackLoad = async(req,res)=>{
    try {
        const session = req.session.user_id;

        const productId=req.query.productId
        res.render('feedback',{productId,session})
    } catch (error) {
        console.log(error.message);
    }
}


const feedback = async(req,res)=>{
    try {
        console.log(req.body);
        const title =req.body.title
        const rated = req.body.rated
        const description = req.body.description
        const userID = req.session.user_id;
        const Uid=mongoose.Types.ObjectId(userID);
        let id_ =req.body.id;
        const id=mongoose.Types.ObjectId(id_);

        const rate_=await Rate.findOne({product:id,userId:Uid});
        console.log(rate_);
        if(rate_){
            rate_.title=title,
            rate_.description=description,
            rate_.rated=rated;
            await rate_.save();
        }
        else{  
 
            const rate =new Rate({
                userId:userID,
                title:title,
                rated:rated,
                description:description,
                product:id 
            });
          
            const rateLog=await rate.save();
            console.log(rateLog);
        }
   
        const count=await Count.findOne({product:id,userId:Uid});
        if(count){
        let sum;
        if(rated==1){
            sum=count.countOne;
            sum=sum+1;
            count.countOne=sum
            await count.save();
        }
        else if(rated==2){
            sum=count.countTwo;
            sum=sum+1
            count.countTwo=sum
            await count.save();
        }
        else if(rated==3){
            sum=count.countThree;
            sum=sum+1
            count.countThree=sum
            await count.save();
        }
        else if(rated==4){
            sum=count.countFour;
            sum=sum+1
            count.countFour=sum
            await count.save();
        }
        else if(rated==5){
            sum=count.countFive;
            sum=sum+1
            count.countFive=sum
            await count.save();
        }
    }
   else{
    let countOne=0;
    let countTwo=0;
    let countThree=0;
    let countFour=0;
    let countFive=0;
    if(rated==1){
    countOne=1;
    }
    else if(rated==2){
        countTwo=1;
    }
    else if(rated==3){
        countThree=1;

    }
    else if(rated==4){
        countFour=1;

    }
    else if(rated==5){
        countFive=1;

    }

  
    const newCount=new Count({
        product:id,
        countOne:countOne,
        countTwo:countTwo,
        countThree:countThree,
        countFour:countFour,
        countFive:countFive,
    })

    await newCount.save()

   }  
    res.status(200).send({
       msg:'jhjfdjdfjhdf'
    })   
    } catch (error) {
        console.log(error.message);
    }
}



module.exports ={
    placeOrder,
    myOrders,
    orderList,
    orderDetails,
    oredrCancel,
    orderReturn,
    orderDetailsAdmin,
    orderShipped,
    orderDelivered,
    acceptReturn,
    confirmPayment,
    feedbackLoad,
    feedback
}