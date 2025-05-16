const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  members: [{
    userId: String,
    role: {
      type: String,
      enum: ['patient', 'doctor'],
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Group', groupSchema);