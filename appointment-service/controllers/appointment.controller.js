const Appointment = require('../models/appointment.model');
const Slot = require('../models/slot.model');
const { produceMessage } = require('../services/kafka.producer');

const appointmentController = {
  // Récupérer les créneaux disponibles
  async getAvailableSlots(req, res) {
    try {
      const { doctorId, date } = req.query;
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const slots = await Slot.find({
        doctorId,
        isAvailable: true,
        startTime: { $gte: startOfDay, $lte: endOfDay },
      });

      res.status(200).json(slots);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des créneaux', error });
    }
  },

  // Créer un rendez-vous
  async createAppointment(req, res) {
    try {
      const { patientId, doctorId, slotId, type, consultationType, patientDetails } = req.body;

      // Vérifier si le créneau est disponible
      const slot = await Slot.findById(slotId);
      if (!slot || !slot.isAvailable) {
        return res.status(400).json({ message: 'Créneau non disponible' });
      }

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

  // Lister les rendez-vous en attente pour le médecin
  async getPendingAppointments(req, res) {
    try {
      const { doctorId } = req.query;
      const appointments = await Appointment.find({ doctorId, status: 'pending' }).populate('slotId');
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error });
    }
  },

  // Valider un rendez-vous
  async validateAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }

      appointment.status = 'confirmed';
      await appointment.save();

      // Publier un événement Kafka
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