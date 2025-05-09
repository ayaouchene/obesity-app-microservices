const kafka = require('../config/kafka');

  const producer = kafka.producer();

  const initProducer = async () => {
    try {
      await producer.connect();
      console.log('Producteur Kafka connecté');
    } catch (error) {
      console.error('Erreur lors de la connexion du producteur Kafka', error);
      process.exit(1);
    }
  };

  const produceMessage = async (topic, message) => {
    try {
      await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      console.log(`Message publié sur ${topic}:`, message);
    } catch (error) {
      console.error('Erreur lors de la publication du message Kafka', error);
    }
  };

  module.exports = { initProducer, produceMessage };