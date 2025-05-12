const mongoose = require('mongoose');

const connect = async () => {
  try {
    await mongoose.connect('mongodb://mongodb:27017/profiledb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    throw error;
  }
};

module.exports = { connect };