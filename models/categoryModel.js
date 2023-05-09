const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({

categoryName:{
    type:String,
    uppercase:true,
    required:true,

}


})

module.exports = mongoose.model('categories',categorySchema);