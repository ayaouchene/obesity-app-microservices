const Appointment = require('../models/appointment.model');
  const Slot = require('../models/slot.model');
  const { produceMessage } = require('../services/kafka.producer');
  const axios = require('axios');

  const appointmentController = {
    async getAvailableSlots(req, res) {
      try {
        const { doctorId, date, page = 1, limit = 10 } = req.query;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const slots = await Slot.find({
          doctorId,
          isAvailable: true,
          startTime: { $gte: startOfDay, $lte: endOfDay },
        })
          .skip((page - 1) * limit)
          .limit(parseInt(limit));

        res.status(200).json(slots);
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des créneaux', error });
      }
    },

    async createAppointment(req, res) {
      try {
        const { patientId, doctorId, slotId, type, consultationType } = req.body;

        // Vérifier si le créneau est disponible
        const slot = await Slot.findOneAndUpdate(
          { _id: slotId, isAvailable: true },
          { $set: { isAvailable: false } },
          { new: true }
        );
        
        if (!slot) {
          return res.status(400).json({ message: 'Créneau non disponible' });
        }

        // Récupérer les coordonnées du patient via gateway-api
        const patientResponse = await axios.get(`http://gateway-api:3000/api/users/${patientId}`, {
          headers: { Authorization: req.header('Authorization') },
        });
        const patientDetails = {
          name: patientResponse.data.name,
          firstName: patientResponse.data.firstName,
          phone: patientResponse.data.phone,
          address: patientResponse.data.address,
        };

        // Créer le rendez-vous
        const appointment = new Appointment({
          patientId,
          doctorId,
          slotId,
          type,
          consultationType,
          patientDetails,
        });

        await appointment.save();

        // Marquer le créneau comme réservé
        slot.isAvailable = false;
        await slot.save();

        // Publier un événement Kafka
        await produceMessage('appointment_created', {
          appointmentId: appointment._id,
          patientId,
          doctorId,
          slotId,
        });

        res.status(201).json(appointment);
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du rendez-vous', error });
      }
    },

    async getPendingAppointments(req, res) {
      try {
        const { doctorId } = req.query;
        if (req.user.role !== 'doctor') {
          return res.status(403).json({ message: 'Accès réservé aux médecins' });
        }
        const appointments = await Appointment.find({ doctorId, status: 'pending' }).populate('slotId');
        res.status(200).json(appointments);
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error });
      }
    },

    async validateAppointment(req, res) {
      try {
        const { id } = req.params;
        if (req.user.role !== 'doctor') {
          return res.status(403).json({ message: 'Accès réservé aux médecins' });
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
          return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        appointment.status = 'confirmed';
        await appointment.save();

        await produceMessage('appointment_confirmed', {
          appointmentId: appointment._id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
        });

        res.status(200).json(appointment);
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la validation du rendez-vous', error });
      }
    },
  };

  module.exports = appointmentController;