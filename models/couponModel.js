const mongoose = require("mongoose");


const couponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
  },

  status: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  maxDiscount: {
    type: Number,
    required: true,
  },
  minAmount: {
    type: Number,
    required: true,
  },
  minDiscount: {
    type: Number,
  },
   user:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',

    }],
    

});

module.exports = mongoose.model("Coupon", couponSchema);