const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateAppointment } = require('../middlewares/validation.middleware');

// Consultation des créneaux disponibles
router.get('/slots', authMiddleware, appointmentController.getAvailableSlots);

// Création d'un rendez-vous
router.post(
  '/',
  authMiddleware,
  validateAppointment,
  appointmentController.createAppointment
);

// Liste des rendez-vous en attente (pour le médecin)
router.get(
  '/',
  authMiddleware,
  appointmentController.getPendingAppointments
);

// Validation d'un rendez-vous par le médecin
router.put(
  '/:id/validate',
  authMiddleware,
  appointmentController.validateAppointment
);

module.exports = router;