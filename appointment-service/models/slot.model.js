const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  doctorId: {
    type: String, // Simplifié : ID du médecin (pas de ref à user-service)
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['online', 'in-person'],
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Slot', slotSchema);