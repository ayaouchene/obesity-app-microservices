const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  profilePhoto: { type: String }, // Base64 ou URL
  coverPhoto: { type: String }, // Base64 ou URL
  contact: {
    cabinetAddress: String,
    cabinetPhone: String,
    cabinetEmail: String,
  },
  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: String,
    endTime: String,
  }],
  certificates: [{
    name: String,
    date: Date,
    location: String,
  }],
  followedPatients: [{ patientId: String, addedAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', profileSchema);