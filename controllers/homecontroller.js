 

 import express from 'express'; 
 import ejs from 'ejs'; 
 import DonateDb from '../models/donation.js'; 
 import MemDb from '../models/register.js';  
 //rss feeds 
 import Parser from 'rss-parser'; 
 const parser = new Parser();

 const app = express(); 
 app.set('view engine', 'ejs'); 
 
 const getHomepage = async (req, res) => {    
     const feeds = [
         'https://news.google.com/rss/search?q=nigeria&hl=en-NG&gl=NG&ceid=NG:en',
         'https://news.google.com/rss/search?q=ireland&hl=en-IE&gl=IE&ceid=IE:en'
     ]; 
     
     try {
         const fetchFeeds = feeds.map(async (url) => {
             const feed = await parser.parseURL(url);
             return feed.items.slice(0, 5).map(article => ({
                 title: article.title,
                 link: article.link
             }));
         });
 
         const documentedFeeds = (await Promise.all(fetchFeeds)).flat(); // Fetch all feeds in parallel
 
         res.render('./pages/index', { documentedFeeds });
     } catch (error) {
         console.error('Error fetching news feeds:', error);
         res.render('./pages/index', { documentedFeeds: [], error: 'Failed to load news' });
     }
 };
  
 
 
 const getAbout  = (req,res)=>{
   res.render('./pages/about');
}    


const getRegister  = (req,res)=>{
   res.render('./pages/register');
}    

const getLogin  = (req,res)=>{
   res.render('./pages/login');
}     

const getSchool  = (req,res)=>{
   res.render('./pages/urhoboschool');
}   

const getContact  = (req,res)=>{
   res.render('./pages/contact');
} 

 
const getProfile  = async (req,res)=>{    
   const member = await MemDb.findOne({_id: res.locals.user.userId}); 
   const dateJoined = member.date;
   const donations = await DonateDb.find({member: res.locals.user.userId, paymentStatus: 'success'});   
   const donationCount = donations.length; 
   const regphonenumb = member.regphone;
   const pfp = member.profilepicture; 
   res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private'); 
   res.render('./pages/dashboard', {pfp, regphonenumb, dateJoined, donations, donationCount});
} 
 

 export default { getHomepage, getAbout, getRegister, getLogin, getSchool, getContact, getProfile }; 