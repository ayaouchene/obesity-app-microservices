const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  content: { type: String, required: true },
  likes: [{ userId: String, type: { type: String, enum: ['patient', 'doctor'] } }],
  comments: [{
    userId: String,
    type: { type: String, enum: ['patient', 'doctor'] },
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);