const InitialAssessment = require('../models/initialAssessment.model');
const { generatePDF } = require('../services/pdf.generator');

const assessmentController = {
  // Soumettre un bilan initial
  async submitAssessment(req, res) {
    try {
      const { appointmentId, patientId, data } = req.body;
      const assessment = new InitialAssessment({
        appointmentId,
        patientId,
        data,
      });

      await assessment.save();
      res.status(201).json(assessment);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la soumission du bilan', error });
    }
  },

  // Générer un PDF pour un bilan initial
  async getAssessmentPDF(req, res) {
    try {
      const { id } = req.params;
      const assessment = await InitialAssessment.findById(id).populate('appointmentId');

      if (!assessment) {
        return res.status(404).json({ message: 'Bilan non trouvé' });
      }

      const pdfBuffer = await generatePDF(assessment);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=assessment_${id}.pdf`,
      });
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du PDF', error });
    }
  },
};

module.exports = assessmentController;