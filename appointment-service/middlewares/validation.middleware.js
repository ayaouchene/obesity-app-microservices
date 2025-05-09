const { body, query, param } = require('express-validator');

  const validate = {
    createAppointment: [
      body('patientId').isString().notEmpty().withMessage('ID patient requis'),
      body('doctorId').isString().notEmpty().withMessage('ID médecin requis'),
      body('slotId').isMongoId().withMessage('Slot ID invalide'),
      body('type').isIn(['online', 'in-person']).withMessage('Type invalide'),
      body('consultationType').isIn(['initial', 'follow-up']).withMessage('Type de consultation invalide'),
    ],
    getAvailableSlots: [
      query('doctorId').isString().notEmpty().withMessage('ID médecin requis'),
      query('date').isISO8601().withMessage('Date invalide'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
      query('limit').optional().isInt({ min: 1 }).withMessage('Limite invalide'),
    ],
    getPendingAppointments: [
      query('doctorId').isString().notEmpty().withMessage('ID médecin requis'),
    ],
    validateAppointment: [
      param('id').isMongoId().withMessage('ID rendez-vous invalide'),
    ],
    createAssessment: [
      body('appointmentId').isMongoId().withMessage('ID rendez-vous invalide'),
      body('patientId').isString().notEmpty().withMessage('ID patient requis'),
      body('data').isObject().withMessage('Données du bilan requises'),
    ],
    getAssessmentPDF: [
      param('id').isMongoId().withMessage('ID bilan invalide'),
    ],
  };

  module.exports = validate;