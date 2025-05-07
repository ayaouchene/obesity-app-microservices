const { body, validationResult } = require('express-validator');

const validateAppointment = [
  body('patientId').isString().notEmpty().withMessage('Patient ID requis'),
  body('doctorId').isString().notEmpty().withMessage('Docteur ID requis'),
  body('slotId').isMongoId().withMessage('Slot ID invalide'),
  body('type').isIn(['online', 'in-person']).withMessage('Type de rendez-vous invalide'),
  body('consultationType').isIn(['initial', 'follow-up']).withMessage('Type de consultation invalide'),
  body('patientDetails.name').isString().notEmpty().withMessage('Nom requis'),
  body('patientDetails.phone').isString().notEmpty().withMessage('Téléphone requis'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateAssessment = [
  body('appointmentId').isMongoId().withMessage('Appointment ID invalide'),
  body('patientId').isString().notEmpty().withMessage('Patient ID requis'),
  body('data').isObject().withMessage('Données du bilan requises'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateAppointment, validateAssessment };