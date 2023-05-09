const mongoose = require('mongoose');

const countSchema = new mongoose.Schema({

    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
        required:true
    },
    countOne:{
        type:Number,
      
    },
    countTwo:{
        type:Number,
      
    }
    ,
    countThree:{
        type:Number,
      
    }
    ,
    countFour:{
        type:Number,
      
    }
    ,
    countFive:{
        type:Number,
      
    }   
})


module.exports = mongoose.model('count',countSchema);