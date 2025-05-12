const mongoose = require('mongoose');

  const appointmentSchema = new mongoose.Schema({
    patientId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    type: {
      type: String,
      enum: ['online', 'in-person'],
      required: true,
    },
    consultationType: {
      type: String,
      enum: ['initial', 'follow-up'],
      required: true,
    },
    patientDetails: {
      name: String,
      firstName: String,
      phone: String,
      address: {
        street: String,
        city: String,
        postalCode: String,
        country: String,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  module.exports = mongoose.model('Appointment', appointmentSchema);