const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({

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
            default:1
        },
        total:{
            type:Number,
            
        }

    }],
    grandTotal:{
        type:Number
    }
    
})


module.exports = mongoose.model('whishlist',wishlistSchema);