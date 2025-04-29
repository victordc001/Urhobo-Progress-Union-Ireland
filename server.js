

  
  import express from 'express';  
  const app = express();
  import ejs from 'ejs';  
  import axios from 'axios'; 
  import fs from 'fs';  
  
  import fetch from 'node-fetch'; 
  import got from 'got'; 
  import Flutterwave from 'flutterwave-node-v3'; 
  import dotenv from 'dotenv';
  dotenv.config();   
 import mongodb from 'mongodb';
  import mongoose from 'mongoose';   

  mongoose.connect(process.env.MONGOOSE_CONNECTION).then(()=>{console.log('success')}).catch((err)=>{console.error(err)});        
  


  const validationString = process.env.VALIDATION_STRING;
  import cookieParser from 'cookie-parser';
  import cors from 'cors';  
   
  import url from 'url';
  import { fileURLToPath } from 'url';
  import { dirname, join } from 'path'; 
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
     
  import session from 'express-session'; 
  import passport from'passport';
  import passportLocal from 'passport-local';
  //const LocalStrategy = passportLocal.Strategy;
  import { Strategy as LocalStrategy } from 'passport-local';
import passportLocalMongoose from 'passport-local-mongoose';
import { ensureLoggedIn } from 'connect-ensure-login';
import bcrypt from 'bcryptjs';
  const saltRounds = 12; 
 import jwt from 'jsonwebtoken'; 
import MemDb from './models/register.js';  
import ContactDb from './models/contact.js';   
import NewsDb from './models/newsletter.js'; 

import DonateDb from './models/donation.js';
 

import globalTok from './middlewares/global.js';  
  import authenticate from './middlewares/authentication.js'; 

import checkTok from './middlewares/authb.js';
import checkbTok from './middlewares/authc.js'; 

import checkcTok from './middlewares/authd.js';
import checkdTok from './middlewares/authe.js';
import admTok from './middlewares/authadmin.js';
import multer from 'multer';
import nodemailer from 'nodemailer';  
import HomeController from './controllers/homecontroller.js';  
//import UserController from './controllers/usercontroller.js';           
//import NewsController from './controllers/newscontroller.js';  


//rss feeds 
import Parser from 'rss-parser'; 
const parser = new Parser();


//stripe integration  

import Stripe from 'stripe';
import e from 'express';

const stripe = new Stripe(process.env.STRIPE_API_KEY); 


const secretkey = process.env.FLW_SECRET_KEY;
const publickey = process.env.FLW_PUBLIC_KEY; 
const flw = new Flutterwave(publickey, secretkey);
   
    app.set('view engine', 'ejs');  
   app.use(express.urlencoded({extended:false}));
   app.use(express.json()); 
   app.use(cors());
   app.use(express.static(join(__dirname + '/public')));  
   app.use(cookieParser()); 
   app.use(globalTok);   
    

   app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});   


 
 

  //set the storage for multer files
 const storage = multer.diskStorage({
     destination : function( req, file, cb) {
           cb(null, 'public/uploads');
     },  

      filename : function (req, file, cb) {
         cb(null, Date.now() + '-' + file.originalname)
      },
     
 });

 //file fitering logic implementation

 const fileFilter = (req, file, cb) => {
   
     if(file.mimetype.startsWith('image/')){
      cb(null, true); // accept the file
     } 

      else{
         cb(new Error('Only image files are allowed!'), false); // reject the file

      }

          } 

  //create the multer instance
 const upload = multer({storage : storage, fileFilter : fileFilter});  


 app.get('/', HomeController.getHomepage);
 app.get('/about', HomeController.getAbout);  
 app.use('/registration', checkbTok);
 app.get('/registration', HomeController.getRegister);   
 app.use('/login', checkTok);
 app.get('/login', HomeController.getLogin);  
 app.get('/urhobo-school', HomeController.getSchool);  
 app.get('/contact', HomeController.getContact);   
 app.get('/gallery', (req,res)=>{
     res.render('./pages/gallery');
 });
 //apply the middleware to the protected route 
 app.use('/dashboard', authenticate); 
 app.get('/dashboard', HomeController.getProfile);    

 app.get('/meet_the_executives', (req,res)=>{
     res.render('./pages/executives');
 });
     

 app.get('/terms_and_conditions', (req,res)=>{
     res.render('./pages/terms')
 });

 app.get('/privacy', (req,res)=>{
         res.render('./pages/privacy');
 });

 //posting member registration
   
app.post('/postingregistration', async (req, res) => {
  try {
    // Hash the password asynchronously
    const hash = await bcrypt.hash(req.body.regpass, saltRounds);

    // Create a new user in the database
    await MemDb.create({
      reguser: req.body.reguser,
      regemail: req.body.regemail, 
      regphone: req.body.regphone,
      regpass: hash,
      firstname: req.body.firstname,
      lastname: req.body.lastname,  
      role : 'client',
    });
   
    res.json({msg : 'success'});

        //send welcome message
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com', 
      port: 587,
      auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASS,
      }
  });

  // Set mail option 
    const mailOptions = {
      from: 'upuiireland@gmail.com',
      to: req.body.regemail,
      subject: 'Welcome to Urhobo Progress Union Ireland!',
      html: `
                    <img style="width:100%" src="https://res.cloudinary.com/drpmtitnn/image/upload/c_pad,w_970,h_300,b_rgb:000000/l_text:montserrat_25_style_light_align_center:Welcome,w_0.5,y_0.30/v1741549912/upuilogo_wgdh7o.png"> 
<br><br>

Hi <b>${req.body.reguser}</b>,  
<br><br>

Welcome to <b>Urhobo Progress Union Ireland!</b> We're excited to have you as a part of our community.  
Here are some details to help you get started:  
<br>
<ul>
    <li>Email: ${req.body.regemail}</li>
    <li>Password: Your Password</li>   
</ul>
<br>

We are committed to fostering unity, culture, and progress within the Urhobo community in Ireland.  
If you have any questions or need assistance, feel free to reach out to us.  
<br><br>

Thank you for joining us!  
<br>
Best regards,  
<br>
<b>Urhobo Progress Union Ireland Team</b>

      `,
  };
  

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
      } else {
          res.status(200).json({ msg : 'success' });
      }
  });     
  //send welcome message end

  }
  
  catch (error) { 
    if (error.code === 11000 && error.keyPattern.regemail) {
      // Duplicate key error for email field
      res.status(400).send('Email is already in use');
    }
    
    else if (error.code === 11000 && error.keyPattern.reguser) {
      // Duplicate key error for username field
      res.status(400).send('Username is already taken');
    }   

    else if (error.code === 11000 && error.keyPattern.regphone) {
      // Duplicate key error for username field
      res.status(400).send('Phone number is already in use');
    } 
    
    else {
      // Other errors
      console.error('Error:', error);
      res.status(500).send('Something went wrong, try again');
    }
    
  }
});          

   //verify the user after registration

   app.get('/verification/:memberemail', async (req,res)=>{ 

  
              const membemail = req.params.memberemail;
              try{
              const memb = await MemDb.findOne({regemail : membemail});  

              if(memb){  

               //Let's check if the member is already verified or we carry out the verification
               if(memb.verified === false){
                     const verifytoken = jwt.sign({userId : memb._id}, process.env.JWT_SECRET_KEY, {
                        expiresIn : '15m'});  
                 const verifyLink = `${req.protocol}://${req.get('host')}/verifyemail/?auser=${memb._id}&token=${verifytoken}`;
    
                 
    //create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com', 
      port: 587,
      auth: {
          user:process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASS,
      }  
  });  

  
    //set mail option
    const mailOptions = {
      from: 'upuiireland@gmail.com',
      to: memb.regemail,
      subject: 'Verify Email',
      text: `To verify your email, click on this link: ${verifyLink}. Note that it expires after 15 minutes.`
   };    

   //Now let's send the email to the memeber 
   transporter.sendMail(mailOptions, async (error, info)=>{
      if(error){
        console.log(error);
      } else{
          const response = 'Click on the link sent to your registered email for your account verification, please check spam if link is not found.';
          res.render('./pages/verify', {resp : response}); 
      }
});  

   
     }   else { 
          //i.e the member is already verified  
          //we dont just assign a cookie to the user because is possible he is coming from the register route so setting cookie directly is not professional enough cos user has not entered password..so let's verify login success
           if(memb.loginsuccess === 1) { 
            await MemDb.findByIdAndUpdate(memb._id, {loginsuccess:0});
           //if user is coming from login route turn login success back to 0 and redirect to dashboard by setting cookie
          const token = jwt.sign({ userId : memb._id, reguser : memb.reguser, firstname : memb.firstname, cookieDisplayed : memb.cookieDisplayed, lastname : memb.lastname, donations : memb.donations, regemail : memb.regemail, role : 'client'}, process.env.JWT_SECRET_KEY, {
            expiresIn : '5d',
         });  

         res.cookie('authToken', token, {httpOnly : true, secure : true}); 
            
            // Take them to thier dashboard
            res.redirect('/dashboard'); 
      } else { 
         //if user is coming from register route , let's take him back to login cos is not possible he is verified at the beginning
         res.redirect('/login');        
      }
  
 }
              }   else {
               const response = 'Email not available in our database, unable to send verification email';
               res.render('./pages/verify', {resp : response});
              }    
      }
            
            catch(err){
               const response = 'OOPS.. An error occured during verification, Refresh the page.';
               res.render('./pages/verify', {resp : response});
               console.log(err);
            }   
            
           
    });
   
  
    //lET'S VERIFY USERS 
     app.get('/verifyemail', async (req,res)=>{
      const memb = req.query.auser; 
                const token = req.query.token;
                //verify the token by jwt
                jwt.verify(token , process.env.JWT_SECRET_KEY, async (err, user)=>{
                          if(err){
                              const response = 'OOPS...The link is invalid!';
                              console.log(err);
                              res.render('./pages/verified', {resp : response});  
                          }  
                         
                      else{   
                     await MemDb.findByIdAndUpdate(memb, {verified : true}); 
                     const response = 'Congratulations! You have been successfully verified. Begin to explore and engage with the Urhobo Progress Union Ireland community today!';
                     //let's be sure whether to take user to dashboard directly or /login route by verifying login success
                     const dmemb = await MemDb.findOne({_id : memb});
                      if(dmemb.loginsuccess == 1) {   
                        await MemDb.findByIdAndUpdate(memb, {loginsuccess:0}); 
                       //if user is coming from login route turn login success back to 0 and redirect to dashboard by setting cookie
                      const token = jwt.sign({ userId : memb._id, reguser : memb.reguser, firstname : memb.firstname, lastname : memb.lastname, donations : memb.donations, regemail : memb.regemail, role : 'client'}, process.env.JWT_SECRET_KEY, {
                        expiresIn : '3d',
                     });  
            
                     res.cookie('authToken', token, {httpOnly : true, secure : true}); 
                        
                        // Take them to thier dashboard
                        const link = 'dashboard'; 
                        res.render('./pages/verified', {resp : response, link : link}); 
                  } else { 
                     //if user is coming from register route , let's take him back to login cos is not possible he is verified at the beginning
                    const link = 'login';    
                    res.render('./pages/verified', {resp : response, link : link});   
                  }
   
                   }  
               });   
 
     }); 
 



     //Handle user login 
      
app.post('/logino', async (req, res)=>{ 
  
  try { 
  const memb = await MemDb.findOne({ regemail: req.body.regemail});
  if(memb) {
     
    await bcrypt.compare(req.body.regpass, memb.regpass, async function (err, auser){

            if(err){  
              res.status(500).send('Something went wrong!');
            } 

             else{ 

              if(auser){  
                 //user passed the challenge of correct credentials entry
                 await MemDb.findByIdAndUpdate(memb._id, {loginsuccess:1});
         //check for verification
         res.status(200).json({message : 'good'});
        }   

        else{
           res.status(401).send('Invalid username or password, please check well and re-provide the correct credentials');     
        }

        }

    }); 
  }       


  else{
     res.status(404).send('User does not exist in our record');      
  }


}   

  catch (err) { 
    res.status(500).send('Something went wrong, please check your internet connection');
     console.log(err);
  }

});    
 


//reset password 
 
app.get('/reset-password', (req,res)=>{
  res.render('./pages/fp');
});   



//log out user
app.get('/logout', (req, res)=>{ 
  res.clearCookie('authToken');
 const user = res.locals.user;   
  res.redirect('/login');
});




app.post('/submitemail', async (req,res)=>{ 
     
try{
       //check if email is available in database
  const email = req.body.anemail;
  const mememail = await MemDb.findOne({ regemail: email}); 
  if(mememail){
  //create token to reset password
  const resetToken = jwt.sign({userid : mememail._id}, process.env.JWT_SECRET_KEY, {
     expiresIn : '15m'});  
     //create reset link from reset token
     const resetLink = `${req.protocol}://${req.get('host')}/resetpassword/?auser=${mememail._id}&token=${resetToken}`;

 ///create SMTP transporter
 const transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com', 
  port: 587,
  auth: {
      user:process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASS,
  }
});

 //set mail option
 const mailOptions = {
  from: 'victoremmy@gmail.com',
  to: mememail.regemail,
  subject: 'Reset password',
  text: `To reset your password, click on this link: ${resetLink}. Note that it expires after 15 minutes.`
}; 


 transporter.sendMail(mailOptions, (error, info)=>{
       if(error){
         console.log(error);
       } else{
           res.status(200).send('success');
       }
 });
} else{
   res.status(404).send('Email not available in our database');
}
}

catch(err){
  res.status(500).send(err);
  console.log(err);
} 
}); 



//verify the token
app.get('/resetpassword', async (req,res)=>{
  const duser = req.query.auser;
  const ouser = await MemDb.findOne({_id: duser});

  if(ouser){
     const token = req.query.token;
     jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{
           if(err){ 
              console.log(err);
              res.status(404).redirect('/notfound');
           } 
           res.render('./pages/setpass', {ouser});
     });
  }

  else{
     res.status(404).redirect('/notfound');
  }
}); 




app.put('/submitpass/:userId', async(req,res)=>{
     const onewpassword = req.body.regpass;
     const newpassword = await bcrypt.hash(onewpassword, saltRounds);
     const userid = req.params.userId;
      const user = await MemDb.findOne({_id: userid});
      const newpswd = {
         regpass : newpassword,
      }
      
      if(user){
          const updatedpswd = await MemDb.findByIdAndUpdate(userid, newpswd, {new : true});
            res.json({message : 'ok'});
          console.log(updatedpswd);  
        } else{
         res.status(400).send('Error resetting password');
      }
});  

  //donate payment gateway integration  
   app.post('/donate', async (req,res)=>{  
           const donateData = req.body.amount;    
          
           try{ 

           if(res.locals.user) {    

            const rnd = Math.floor(Math.random() * 900000) + 100000;  
            const donateId = 'upui' + rnd;  
                 
// Get current timestamp
const currentUnixTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
// Set expiration to 15 hours later
const expiresAt = currentUnixTimestamp + (15 * 60 * 60); // 15 hours in seconds   

 
  //generate a transaction reference for this transaction  
  const randomCharacter = Math.floor(Math.random() * 900000) + 100000;
  const trxRef =  'uPuI' + randomCharacter;   
  const txRef = await bcrypt.hash(trxRef, saltRounds);  

  
    //web domain generation 
     const WEB_DOMAIN = `${req.protocol}://${req.get('host')}`; 

     await DonateDb.create({
         member : res.locals.user.userId,
         amount : donateData, 
         uniqueId : donateId,
         trxRef : txRef,
     });



            const session = await stripe.checkout.sessions.create({  
    
              line_items: [
                {
                    price_data: {
                        currency: 'gbp', // Make sure to use 'gbp' for British pounds
                        product_data: {
                            name: 'UPUI', // Provide a description or name for the product
                        },
                        unit_amount: Math.round(donateData * 100), // Convert to pence  
                    }, 
                    quantity: 1,
                },
            ],  
              mode: 'payment', 
              expires_at: expiresAt,
              success_url: `${WEB_DOMAIN}/success_xbe87c3r2c67v3r2/${trxRef}/${uniqueId}`,
              cancel_url: `${WEB_DOMAIN}/cancel_ebgrdyuwregi4r3gg6g/${trxRef}/${uniqueId}`, 
            });
             console.log(session);
             res.json({paymenturl: session.url}); 
           } else {
               await res.status(402).send('Please login first');
           } 

          }   catch(err) {
              await res.status(500).send(err);
          }
   }); 


   

    
app.use('/success_xbe87c3r2c67v3r2/:trxRef/:donateid', authenticate); 
app.get('/success_xbe87c3r2c67v3r2/:trxRef/:donateid', async (req,res)=>{  

     const trxReff = req.params.trxRef;  
     const ddonateid = req.params.donateid; 
     const donation = await DonateDb.findById(ddonateid);
      
     if(!donation) {
          res.status(404).redirect('/notfound');
     }   
     
     //validate transaction   
     const itsMatch = await bcrypt.compare(trxReff, donation.trxRef);
if (itsMatch) {  
     //change the donation status to success
      await DonateDb.findByIdAndUpdate(ddonateid, {paymentStatus: 'success'}, {new: true});
     res.render('./pages/ordersuccess');  
} else {
  res.render('./pages/notfound');  
}  
 
  });       
  
  

  
  
app.use('/cancel_ebgrdyuwregi4r3gg6g/:trxRef/:donateid', authenticate); 
  app.get('/cancel_ebgrdyuwregi4r3gg6g/:trxRef/:donateid', async (req,res)=>{  

    const trxReff = req.params.trxRef;  
     const ddonateid = req.params.donateid; 
     const donation = await DonateDb.findById(ddonateid);
      
     if(!donation) {
          res.status(404).redirect('/notfound');  
     }   
     //delete the payment request from database 
     await DonateDb.findByIdAndDelete(ddonateid); 
     res.render('./pages/ordercancel'); 
 }); 
    

   
app.use('/updateprofiledata', authenticate);  
app.post('/updateprofiledata',  async (req,res)=>{
     const parseddata = req.body; 
     //Now let's start updaring the user information 
     const duser = res.locals.user;
     const memb = await MemDb.findOne({_id : duser.userId});  
     
  try{  
         // Construct update object
    const updateFields = {
      reguser: parseddata.reguser || memb.reguser,
      firstname: parseddata.firstname || memb.firstname,
      lastname: parseddata.lastname || memb.lastname,
      regemail: parseddata.regemail || memb.regemail,
      regphone: parseddata.regphone || memb.regphone
    };

    // Perform update
    const updatedUser = await MemDb.findByIdAndUpdate(
      duser.userId,
      updateFields,
      { new: true } // Ensures updated document is returned
    ); 
      res.set('Cache-Control', 'no-store'); 
      res.status(200).json({message : 'ok'}); 
      console.log(updatedUser);
  }   catch(error) { 

    if (error.code === 11000 && error.keyPattern.regemail) {
      // Duplicate key error for email field
      res.status(400).send('Email is already in use');
    }
    
    else if (error.code === 11000 && error.keyPattern.reguser) {
      // Duplicate key error for username field
      res.status(400).send('Username is already taken');
    }   

    else if (error.code === 11000 && error.keyPattern.regphone) {
      // Duplicate key error for username field
      res.status(400).send('Phone number is already in use');
    } 
      else{
      res.status(500).send('An Error Occured , pls try again.'); 
      console.log(error); 
      }
  }
});  
    

//update profile picture 

app.post('/upldpfp', upload.single('profilePicture'), async (req,res)=>{
  const pfp = req.file;
  console.log(pfp);  
  const duser = res.locals.user;
  try{
     await MemDb.findByIdAndUpdate(duser.userId, {
        'profilepicture.originalname' : pfp.originalname,
        'profilepicture.mimetype': pfp.mimetype,
        'profilepicture.size': pfp.size,
        'profilepicture.path': `/uploads/${pfp.filename}`,
    }, { new: true });  
           res.status(200).json({msg : 'uploaded'});
  }   catch (err) {
        console.log(err);
        res.status(500).json({msg : 'error occured'});
  }
}); 

  
//handle contacting action  

app.post('/postcontact', async (req, res) => {
  const condata = req.body;
  console.log(condata); 

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASS,
    },
  });
  
   const reportingemail = ['alexaroh@yahoo.com', 'upuiireland@gmail.com', 'victoremmy1876@gmail.com'];
  // Email content sent to your internal mailbox
  const mailOptions = {
    from: 'upuiireland@gmail.com',
    to: reportingemail.join(','),
    subject: `New Contact Form Submission: ${condata.sendersubject}`,
    html: `
      <h2>New Contact Form Message</h2>
      <p><strong>Name:</strong> ${condata.sendername}</p>
      <p><strong>Phone:</strong> ${condata.senderphone}</p>
      <p><strong>Email:</strong> ${condata.senderemail}</p>
      <p><strong>Subject:</strong> ${condata.sendersubject}</p>
      <p><strong>Message:</strong><br>${condata.sendermessage}</p>
    `,
  };

  try {
    await ContactDb.create(condata); 
    await transporter.sendMail(mailOptions); // Send email
    res.status(200).send('Message Sent Successfully');
  } catch (err) {
    console.error(err);
    res.status(400).send('Error sending message');
  }
});

 


app.post('/newsl', async (req,res)=>{
  const newsdata = req.body;  

  try{
        await NewsDb.create(newsdata);
        res.status(200).send('Message Sent Successfully');
  } 

   catch(err){
      res.status(400).send('Error sending message'); 
      console.log(err);
   }
});   



  
 

 app.get('/notfound', (req,res)=>{
  res.render('./pages/notfound.ejs');
});
 

   // Wildcard route to handle all other routes (Not found pages)
   app.get('/*', (req,res)=>{
    res.render('./pages/notfound.ejs');
 });     


app.listen(3000 , '0.0.0.0', ()=>{
 console.log('listening to the port 3000');
});   
 