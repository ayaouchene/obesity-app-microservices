const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  following: [{
    userId: String,
    type: { type: String, enum: ['patient', 'doctor'] },
    followedAt: { type: Date, default: Date.now },
  }],
});

module.exports = mongoose.model('Follow', followSchema);