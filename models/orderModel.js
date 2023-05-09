const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    required:true
},
item:[{
  product:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'products',
      required:true
  },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      total:{
        type:Number,
       
    }

    }],
  start_date: {
    type: Date,
    default:Date.now()
  },
  delivered_date: {
    type: Date,
  },
  totalPrice: {
    type: String,
  },
  allTotal: {
    type: String,
  },
  is_delivered: {
    type: Boolean,
    default: false,
  },
  user_cancelled: {
    type: Boolean,
    default: false,
  },
  admin_cancelled: {
    type: Boolean,
    default: false,
  },
  orderCount: {
    type: Number,
    default: 0,
  },
  is_returned: {
    type: Number,
    default: 0,
  },
  address:[{
    type:String
   }],
  paymentType: {
    type: String,
  },
  status:{
    type:String,
    default:"Order Confirmed"
  }
});

module.exports = mongoose.model("Orders", orderSchema);