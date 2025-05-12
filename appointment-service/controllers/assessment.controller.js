const InitialAssessment = require('../models/initialAssessment.model');
const Appointment = require('../models/appointment.model');
const { produceMessage } = require('../services/kafka.producer');
const PDFDocument = require('pdfkit');

const assessmentController = {
  async submitAssessment(req, res) {
    try {
      const { appointmentId, patientId, data } = req.body;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId,
      });
      if (!appointment) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé ou non autorisé' });
      }

      const assessment = new InitialAssessment({
        appointmentId,
        patientId,
        data,
      });

      await assessment.save();

      await produceMessage('assessment_submitted', {
        assessmentId: assessment._id,
        appointmentId,
        patientId,
      });

      res.status(201).json(assessment);
    } catch (error) {
      console.error('Erreur lors de la soumission du bilan:', error);
      res.status(500).json({ message: 'Erreur lors de la création du bilan', error });
    }
  },

  async generateAssessmentPDF(req, res) {
    try {
      const { id } = req.params;
      console.log(`Génération du PDF pour l'évaluation ID: ${id}`);

      // Vérifier les permissions
      if (req.user.role !== 'doctor') {
        console.log('Accès refusé: utilisateur non médecin', req.user);
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }

      // Vérifier si l'évaluation existe
      const assessment = await InitialAssessment.findById(id);
      if (!assessment) {
        console.log(`Évaluation non trouvée pour ID: ${id}`);
        return res.status(404).json({ message: 'Bilan non trouvé' });
      }

      // Créer le PDF
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=assessment_${id}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).text('Bilan Initial', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Patient ID: ${assessment.patientId}`);
      doc.text(`Appointment ID: ${assessment.appointmentId}`);
      doc.moveDown();

      // Ajouter les données du bilan
      const { data } = assessment;
      if (data.weightHistory) {
        doc.text('Historique de poids:');
        doc.text(`Âge de début: ${data.weightHistory.startAge || 'N/A'}`);
        doc.text(`Poids idéal: ${data.weightHistory.idealWeight || 'N/A'} kg`);
        doc.moveDown();
      }

      if (data.eatingHabits) {
        doc.text('Habitudes alimentaires:');
        doc.text(`Repas sautés: ${data.eatingHabits.skippedMeals || 'N/A'}`);
        doc.text(`Manger la nuit: ${data.eatingHabits.nightEating || 'N/A'}`);
        doc.moveDown();
      }

      if (data.foodIntake && data.foodIntake.highEnergyFoods) {
        doc.text('Aliments riches en énergie:');
        data.foodIntake.highEnergyFoods.forEach(food => {
          doc.text(`- ${food.type} (${food.frequency})`);
        });
      }

      doc.end();
      console.log(`PDF généré avec succès pour l'évaluation ID: ${id}`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du PDF', error: error.message });
    }
  },
};

module.exports = assessmentController;