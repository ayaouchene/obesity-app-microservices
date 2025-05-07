const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateAssessment } = require('../middlewares/validation.middleware');

// Soumission d'un bilan initial
router.post('/', authMiddleware, validateAssessment, assessmentController.submitAssessment);

// Génération d'un PDF pour un bilan
router.get('/:id/pdf', authMiddleware, assessmentController.getAssessmentPDF);

module.exports = router;