  

import express from 'express'; 
import mongoose from 'mongoose'; 
import bcrypt from 'bcryptjs';

 const RegisterSchema = new mongoose.Schema({
    
    reguser : {
        type: String,
        required : true, 
        unique : true,
    },    

    regemail : {
        type: String,
        required : true, 
        isEmail : true,
        unique : true,
    },  

    
    regphone : {
        type: String, 
        required : true,
    },  

    regpass : {
        type: String, 
        required : true,
    },  
     
    firstname : {
        type: String,
        required : true,
    },   

   lastname : {
        type: String,
        required : true,
    },  
 
     

    profilepicture: {
        originalname : { type : String},
        mimetype : { type : String},
        size : { type : Number},
        path : { type : String},
    }, 

    role : {
        type : String, 
    }, 

    donations : {
        type : Number,
        default : 0,
    },
        
    verified : {
         type : Boolean,
         default : false,
    },  
    
    loginsuccess : {
        type : Number,
        default : 0,   
    },

    expirationTime : {
          type : Date,
    }, 

    cookieDisplayed : {
         type : Number,
         default : 0,
    },

    date: {
        type: Date,
        default: () => Date.now(), // Ensures the date is set when a new document is created
    }
    
  

 });   
 
 
 const Mem = mongoose.model('Upuimembers', RegisterSchema);
 //module.exports = Mem;
 export default Mem;


  