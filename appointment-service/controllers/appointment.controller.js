const Appointment = require('../models/appointment.model');
const Slot = require('../models/slot.model');
const { produceMessage } = require('../services/kafka.producer');
const axios = require('axios');

const appointmentController = {
  async createAppointment(req, res) {
    try {
      const { patientId, doctorId, slotId, type, consultationType } = req.body;
      const slot = await Slot.findById(slotId);
      if (!slot || !slot.isAvailable) {
        return res.status(400).json({ message: 'Créneau non disponible' });
      }

      const patientResponse = await axios.get(`http://auth-service:5000/api/users/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}` // Transmet le token reçu
        }
      });
      const patientDetails = patientResponse.data;

      const appointment = new Appointment({
        patientId,
        doctorId,
        slotId,
        type,
        consultationType,
        patientDetails,
        status: 'pending',
      });

      slot.isAvailable = false;
      await slot.save();
      await appointment.save();

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

  async getAvailableSlots(req, res) {
    try {
      const { doctorId, date, page = 1, limit = 10 } = req.query;
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const slots = await Slot.find({
        doctorId,
        startTime: { $gte: startOfDay, $lte: endOfDay },
        isAvailable: true,
      })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.status(200).json(slots);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des créneaux', error });
    }
  },

  async getPendingAppointments(req, res) {
    try {
      const { doctorId } = req.query;
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }

      const appointments = await Appointment.find({ doctorId, status: 'pending' });
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

      // Ajouter le patient à la liste des suivis
      await produceMessage('patient_followed', {
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
      });

      res.status(200).json(appointment);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la validation du rendez-vous', error });
    }
  },

  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const { slotId, type, consultationType } = req.body;

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }

      if (slotId) {
        const slot = await Slot.findById(slotId);
        if (!slot || !slot.isAvailable) {
          return res.status(400).json({ message: 'Créneau non disponible' });
        }
        if (appointment.slotId) {
          await Slot.updateOne({ _id: appointment.slotId }, { $set: { isAvailable: true } });
        }
        slot.isAvailable = false;
        await slot.save();
        appointment.slotId = slotId;
      }

      if (type) appointment.type = type;
      if (consultationType) appointment.consultationType = consultationType;

      await appointment.save();

      await produceMessage('appointment_updated', {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        slotId: appointment.slotId,
      });

      res.status(200).json(appointment);
    } catch (error) {
      console.error('Erreur lors de la modification du rendez-vous:', error);
      res.status(500).json({ message: 'Erreur lors de la modification du rendez-vous', error });
    }
  },

  async rejectAppointment(req, res) {
    try {
      const { id } = req.params;
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }

      if (appointment.status !== 'pending') {
        return res.status(400).json({ message: 'Seuls les rendez-vous en attente peuvent être refusés' });
      }

      appointment.status = 'rejected';
      await appointment.save();

      await Slot.updateOne({ _id: appointment.slotId }, { $set: { isAvailable: true } });

      await produceMessage('appointment_rejected', {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
      });

      res.status(200).json(appointment);
    } catch (error) {
      console.error('Erreur lors du refus du rendez-vous:', error);
      res.status(500).json({ message: 'Erreur lors du refus du rendez-vous', error });
    }
  },
};

module.exports = appointmentController;