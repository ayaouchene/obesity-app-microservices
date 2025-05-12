const { Kafka } = require('kafkajs');
const Profile = require('../models/profile.model');

const kafka = new Kafka({
  clientId: 'profile-medecin-service',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'profile-medecin-service-group' });

const initConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Consommateur Kafka connecté');

    await consumer.subscribe({ topic: 'patient_followed', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        console.log(`Message reçu sur ${topic}:`, data);

        if (topic === 'patient_followed') {
          const { doctorId, patientId } = data;
          let profile = await Profile.findOne({ doctorId });
          if (!profile) {
            profile = new Profile({ doctorId });
          }
          if (!profile.followedPatients.some(p => p.patientId === patientId)) {
            profile.followedPatients.push({ patientId });
            await profile.save();
            console.log(`Patient ${patientId} ajouté aux suivis du médecin ${doctorId}`);
          }
        }
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du consommateur Kafka:', error);
  }
};

module.exports = { initConsumer };