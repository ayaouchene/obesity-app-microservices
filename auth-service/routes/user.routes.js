const express = require('express');
  const router = express.Router();
  const Patient = require('../models/patient.model');
  const Doctor = require('../models/doctor.model');
  const authMiddleware = require('../middlewares/auth.middleware');

  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      let user = await Patient.findOne({ userId: req.params.id });
      let role = 'patient';
      if (!user) {
        user = await Doctor.findOne({ userId: req.params.id });
        role = 'doctor';
      }
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.status(200).json({
        userId: user.userId,
        name: user.name,
        firstName: user.firstName,
        phone: user.phone,
        address: user.address,
        role,
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de l’utilisateur', error });
    }
  });

  module.exports = router;