const express = require('express');
  const router = express.Router();
  const assessmentController = require('../controllers/assessment.controller');
  const validate = require('../middlewares/validation.middleware');
  const authMiddleware = require('../middlewares/auth.middleware');

  router.post('/', authMiddleware, validate.createAssessment, assessmentController.submitAssessment);
  router.get('/:id/pdf', authMiddleware, validate.getAssessmentPDF, assessmentController.generateAssessmentPDF);

  module.exports = router;