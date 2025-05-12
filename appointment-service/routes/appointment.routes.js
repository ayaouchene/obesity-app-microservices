const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/slots', verifyToken, appointmentController.getAvailableSlots);
router.post('/', verifyToken, appointmentController.createAppointment);
router.get('/', verifyToken, appointmentController.getPendingAppointments);
router.put('/:id/validate', verifyToken, appointmentController.validateAppointment);
router.put('/:id', verifyToken, appointmentController.updateAppointment);
router.put('/:id/reject', verifyToken, appointmentController.rejectAppointment);

module.exports = router;