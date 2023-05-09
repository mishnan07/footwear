const mongoose=require('mongoose');

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'categories'
    },
    brand:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    stock:{
        type:String,
        required:true
    },
    size:{
        type:Number,
        required:true
    },
    is_unListed:{
        type:Boolean,
        default:false
       }

})


module.exports = mongoose.model('products',productSchema)