const mongoose = require('mongoose');

const privateChatSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'closed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PrivateChat', privateChatSchema);
