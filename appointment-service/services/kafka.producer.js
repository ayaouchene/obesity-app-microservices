const kafka = require('../config/kafka');

const producer = kafka.producer();

const produceMessage = async (topic, message) => {
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Message publié sur ${topic}:`, message);
  } catch (error) {
    console.error('Erreur lors de la publication du message Kafka', error);
  } finally {
    await producer.disconnect();
  }
};

module.exports = { produceMessage };