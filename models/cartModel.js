const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({

   
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
        quantity:{
            type:Number,
            default:1,
            required:true
        }, 
        total:{
            type:Number,
           
        }

    }],
    grandTotal:{
        type:Number
    }
    


})

module.exports = mongoose.model('cart',cartSchema);