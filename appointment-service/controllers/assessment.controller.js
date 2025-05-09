const InitialAssessment = require('../models/initialAssessment.model');
  const Appointment = require('../models/appointment.model');
  const { generatePDF } = require('../services/pdf.generator');
  const axios = require('axios');

  const assessmentController = {
    async createAssessment(req, res) {
      try {
        const { appointmentId, patientId, data } = req.body;

        // Vérifier si le rendez-vous existe
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment || appointment.patientId !== patientId) {
          return res.status(404).json({ message: 'Rendez-vous non trouvé ou patient non autorisé' });
        }

        // Récupérer les informations du patient via gateway-api
        const patientResponse = await axios.get(`http://gateway-api:3000/api/users/${patientId}`, {
          headers: { Authorization: req.header('Authorization') },
        });

        // Créer le bilan initial
        const assessment = new InitialAssessment({
          appointmentId,
          patientId,
          patientName: patientResponse.data.name,
          patientFirstName: patientResponse.data.firstName,
          data,
        });

        await assessment.save();
        res.status(201).json(assessment);
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du bilan', error });
      }
    },

    async getAssessmentPDF(req, res) {
      try {
        const { id } = req.params;
        const assessment = await InitialAssessment.findById(id);
        if (!assessment) {
          return res.status(404).json({ message: 'Bilan non trouvé' });
        }

        const pdfBuffer = await generatePDF(assessment);
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=assessment.pdf',
        });
        res.send(pdfBuffer);
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la génération du PDF', error });
      }
    },
  };

  module.exports = assessmentController;