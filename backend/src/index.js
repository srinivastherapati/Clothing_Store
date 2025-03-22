import express from 'express';
import mongoose from 'mongoose';

import cors from 'cors'
import customerRouter from './apis/customer.js';
import loginRouter from './apis/login.js';
import productRouter from './apis/Products.js';
import ordersRouter from './apis/Orders.js';
import wishlistRouter from './apis/wishlist.js';
const app=express();
const db = mongoose.connection;
app.use(express.json());
app.use(customerRouter);
app.use(loginRouter);
app.use(productRouter);
app.use(ordersRouter);
app.use(wishlistRouter)

app.use(cors());


// Allow specific origins
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
  })

// Check MongoDB connection
mongoose.connect('mongodb+srv://chakri:chakri123@cluster0.bgbz3be.mongodb.net/Clothing?retryWrites=true&w=majority&appName=Cluster0',
 {useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true });

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
}); 



app.listen(3001,()=>{
    console.log("Server is running")
})