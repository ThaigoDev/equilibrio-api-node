const express = require("express"); 
const mongoose = require('mongoose'); 
const path= require('path');  
const flash  = require('connect-flash');     
const cors = require("cors");
const session = require("express-session");  
const MongoStore = require('connect-mongo');  
const router = require("./src/routes/routes")
require('dotenv').config(); 
const app = express(); 
app.use(express.json()); 

app.use(express.urlencoded({extended :true})); 
app.use(express.static('public')); 

mongoose.connect(process.env.CONNECTION_URI).then(()=>{
   console.log("Conectando..."); 
   app.emit('Conected'); 
}) 
app.on('Conected',()=>{
   app.listen(process.env.PORT, ()=>{
      console.log('Acesse: http://localhost:3000/'); 
   })
}) 

const sessionOptions = session({
   secret : "Project Sessions", 
   store: MongoStore.create({mongoUrl: process.env.CONNECTION_URI}), 
   resave: false, 
   saveUninitialized:false, 
   cookie : {
       maxAge: 1000 * 60 * 60 *7, 
       httpOnly: true
   }
}) 
app.use(sessionOptions); 
app.use(flash());  
app.use(cors());
app.use(router); 