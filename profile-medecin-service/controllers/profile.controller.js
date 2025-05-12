const Profile = require('../models/profile.model');
const { produceMessage } = require('../services/kafka.producer');

const profileController = {
  // Initialiser ou obtenir le profil du médecin
  async getProfile(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      let profile = await Profile.findOne({ doctorId: req.user.userId });
      if (!profile) {
        profile = new Profile({ doctorId: req.user.userId });
        await profile.save();
      }
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du profil', error });
    }
  },

  // Mettre à jour la photo de profil
  async updateProfilePhoto(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { photo } = req.body; // Base64 string
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { profilePhoto: photo },
        { new: true, upsert: true }
      );
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la photo de profil', error });
    }
  },

  // Mettre à jour la photo de couverture
  async updateCoverPhoto(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { photo } = req.body; // Base64 string
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { coverPhoto: photo },
        { new: true, upsert: true }
      );
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la photo de couverture', error });
    }
  },

  // Supprimer la photo de profil
  async deleteProfilePhoto(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { $unset: { profilePhoto: 1 } },
        { new: true }
      );
      if (!profile) return res.status(404).json({ message: 'Profil non trouvé' });
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression de la photo de profil', error });
    }
  },

  // Supprimer la photo de couverture
  async deleteCoverPhoto(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { $unset: { coverPhoto: 1 } },
        { new: true }
      );
      if (!profile) return res.status(404).json({ message: 'Profil non trouvé' });
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression de la photo de couverture', error });
    }
  },

  // Mettre à jour les coordonnées
  async updateContact(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { cabinetAddress, cabinetPhone, cabinetEmail } = req.body;
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { contact: { cabinetAddress, cabinetPhone, cabinetEmail } },
        { new: true, upsert: true }
      );
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour des coordonnées', error });
    }
  },

  // Mettre à jour les disponibilités
  async updateAvailability(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { availability } = req.body; // [{ day, startTime, endTime }]
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { availability },
        { new: true, upsert: true }
      );

      // Publier un message Kafka pour synchroniser avec Appointment-Service
      await produceMessage('availability_updated', {
        doctorId: req.user.userId,
        availability,
      });

      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour des disponibilités', error });
    }
  },

  // Ajouter un certificat
  async addCertificate(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { name, date, location } = req.body;
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { $push: { certificates: { name, date, location } } },
        { new: true, upsert: true }
      );
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'ajout du certificat', error });
    }
  },

  // Modifier un certificat
  async updateCertificate(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { certificateId } = req.params;
      const { name, date, location } = req.body;
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId, 'certificates._id': certificateId },
        { $set: { 'certificates.$': { name, date, location } } },
        { new: true }
      );
      if (!profile) return res.status(404).json({ message: 'Certificat ou profil non trouvé' });
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du certificat', error });
    }
  },

  // Supprimer un certificat
  async deleteCertificate(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { certificateId } = req.params;
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { $pull: { certificates: { _id: certificateId } } },
        { new: true }
      );
      if (!profile) return res.status(404).json({ message: 'Certificat ou profil non trouvé' });
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression du certificat', error });
    }
  },

  // Consulter les patients suivis
  async getFollowedPatients(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const profile = await Profile.findOne({ doctorId: req.user.userId });
      if (!profile) return res.status(404).json({ message: 'Profil non trouvé' });
      res.status(200).json(profile.followedPatients);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des patients suivis', error });
    }
  },

  // Supprimer un patient suivi
  async removeFollowedPatient(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { patientId } = req.params;
      const profile = await Profile.findOneAndUpdate(
        { doctorId: req.user.userId },
        { $pull: { followedPatients: { patientId } } },
        { new: true }
      );
      if (!profile) return res.status(404).json({ message: 'Profil non trouvé' });
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression du patient suivi', error });
    }
  },
};

module.exports = profileController;