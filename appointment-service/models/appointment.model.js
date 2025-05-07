const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: String, // Simplifié : ID du patient
    required: true,
  },
  doctorId: {
    type: String, // Simplifié : ID du médecin
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
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      postalCode: { type: String },
    },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);