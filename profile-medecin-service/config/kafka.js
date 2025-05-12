const { Kafka } = require('kafkajs');
const kafka = new Kafka({
  clientId: 'profile-medecin-service',
  brokers: ['kafka:9092'],
});

const connect = async () => {
  try {
    await kafka.admin().connect();
    console.log('Kafka Admin connecté');
    await kafka.admin().disconnect();
  } catch (error) {
    console.error('Erreur de connexion à Kafka:', error);
    throw error;
  }
};

module.exports = { connect };