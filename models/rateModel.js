const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    rated:{
        type:Number,
        default:0
    },
    title:{
        type:String,
    },
    description:{
        type:String
    } 

    
})


module.exports = mongoose.model('rate',rateSchema);