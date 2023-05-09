const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: Array,
    required: true,
  },
  mainHeading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  is_unListed:{
    type:Boolean,
    default:false
   }
});

module.exports = mongoose.model("Banner", bannerSchema);