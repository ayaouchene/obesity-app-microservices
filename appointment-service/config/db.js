const mongoose = require('mongoose');

   const connectDB = async () => {
     try {
       await mongoose.connect('mongodb://mongodb:27017/appointmentsdb', {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       });
       console.log('MongoDB connecté');
     } catch (error) {
       console.error('Erreur de connexion MongoDB:', error);
       process.exit(1);
     }
   };

   module.exports = connectDB;