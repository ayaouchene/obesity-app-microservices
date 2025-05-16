const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { default: mongoose } = require('mongoose');

const authController = {
  async register(req, res) {
    try {
      const { userId, email, password, role, ...data } = req.body;

      if (role === 'patient') {
        const existingPatient = await Patient.findOne({ $or: [{ userId }, { email }] });
        if (existingPatient) {
          return res.status(400).json({ message: 'Utilisateur ou email déjà existant' });
        }

        const patient = new Patient({ userId, email, password, ...data });
        await patient.save();

        // Connexion à la base de données chatdb et ajout au groupe Obesity
        const groupConnection = mongoose.createConnection('mongodb://mongodb:27017/chatdb');
        const Group = groupConnection.model('Group', new mongoose.Schema({
          name: String,
          members: [{ userId: String, role: String }],
        }));

        const obesityGroup = await Group.findOne({ name: 'Obesity' });
        if (obesityGroup) {
          obesityGroup.members.push({ userId, role: 'patient' });
          await obesityGroup.save();
        }

        await groupConnection.close();

        const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });

      } else if (role === 'doctor') {
        const existingDoctor = await Doctor.findOne({ $or: [{ userId }, { email }] });
        if (existingDoctor) {
          return res.status(400).json({ message: 'Utilisateur ou email déjà existant' });
        }

        const doctor = new Doctor({ userId, email, password, ...data });
        await doctor.save();

        const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });

      } else {
        return res.status(400).json({ message: 'Rôle invalide' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l’inscription', error });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      let user = await Patient.findOne({ email });
      let role = 'patient';

      if (!user) {
        user = await Doctor.findOne({ email });
        role = 'doctor';
      }

      if (!user) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }

      const token = jwt.sign({ userId: user.userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token });

    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
  },
};

module.exports = authController;
