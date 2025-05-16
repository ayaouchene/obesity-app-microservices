const mongoose = require('mongoose');
const Group = require('./models/group.model');
require('dotenv').config();

const groups = [
  { name: 'Obesity', description: 'Groupe général pour tous les patients' },
  { name: 'Obesity + Grossesse', description: 'Groupe pour les patients enceintes' },
  { name: 'Obesity + Diabète', description: 'Groupe pour les patients diabétiques' },
  { name: 'Obesity + Hypertension', description: 'Groupe pour les patients avec hypertension' },
];

const initGroups = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    for (const group of groups) {
      const existingGroup = await Group.findOne({ name: group.name });
      if (!existingGroup) {
        await Group.create(group);
        console.log(`Groupe ${group.name} créé`);
      }
    }

    console.log('Initialisation des groupes terminée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l’initialisation:', error);
    process.exit(1);
  }
};

initGroups();