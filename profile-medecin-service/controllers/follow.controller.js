const Follow = require('../models/follow.model');

const followController = {
  // Suivre un utilisateur (patient ou médecin)
  async followUser(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { userId, type } = req.body; // type: 'patient' ou 'doctor'
      let follow = await Follow.findOne({ doctorId: req.user.userId });
      if (!follow) {
        follow = new Follow({ doctorId: req.user.userId });
      }
      if (!follow.following.some(f => f.userId === userId)) {
        follow.following.push({ userId, type });
        await follow.save();
      }
      res.status(200).json(follow);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors du suivi', error });
    }
  },

  // Ne plus suivre un utilisateur
  async unfollowUser(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const { userId } = req.params;
      const follow = await Follow.findOneAndUpdate(
        { doctorId: req.user.userId },
        { $pull: { following: { userId } } },
        { new: true }
      );
      if (!follow) return res.status(404).json({ message: 'Suivi non trouvé' });
      res.status(200).json(follow);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors du désabonnement', error });
    }
  },

  // Obtenir la liste des suivis
  async getFollowedUsers(req, res) {
    try {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Accès réservé aux médecins' });
      }
      const follow = await Follow.findOne({ doctorId: req.user.userId });
      if (!follow) return res.status(200).json({ following: [] });
      res.status(200).json(follow.following);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des suivis', error });
    }
  },
};

module.exports = followController;