const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false,
  },
  privateChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrivateChat',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);