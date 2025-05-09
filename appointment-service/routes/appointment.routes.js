const express = require('express');
  const router = express.Router();
  const appointmentController = require('../controllers/appointment.controller');
  const validate = require('../middlewares/validation.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');

  router.get('/slots', authMiddleware, validate.getAvailableSlots, appointmentController.getAvailableSlots);
  router.post('/', authMiddleware, validate.createAppointment, appointmentController.createAppointment);
  router.get('/', authMiddleware, validate.getPendingAppointments, appointmentController.getPendingAppointments);
  router.put('/:id/validate', authMiddleware, validate.validateAppointment, appointmentController.validateAppointment);

  module.exports = router;