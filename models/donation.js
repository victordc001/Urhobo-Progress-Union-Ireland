import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({ 

  member: {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Upuimembers', // reference to the user model
    required : true,
},   

amount:{ 
     type: String,
     required: true,
},

  paymentStatus: {
    type: String,
    default: 'pending',
  },  

  trxRef: { 
    type: String, 
  }, 

  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

const Donation = mongoose.model('Donations', DonationSchema);  
export default Donation;
