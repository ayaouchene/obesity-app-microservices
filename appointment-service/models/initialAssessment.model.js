const mongoose = require('mongoose');

const initialAssessmentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  data: {
    type: Object, // Stocke les données du formulaire (flexible)
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InitialAssessment', initialAssessmentSchema);