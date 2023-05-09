const mongoose=require('mongoose');
mongoose.set('strictQuery',false)
require('dotenv').config()
mongoose.connect(process.env.mongodb);
const path=require("path")
const nocache = require('nocache')
const express=require('express');  
const app=express();

// const morgan = require('morgan');
// app.use(morgan('tiny'));


app.use (express.static (path.join (__dirname, '/public')))
app.use(nocache());

//for user route
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

//for admin route
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

const errorRoute = require('./routes/404');

app.use('*',errorRoute);

app.listen(5000,function(){
    console.log('serveris running....');
})
