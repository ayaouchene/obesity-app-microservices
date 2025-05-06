const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'chat-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    console.log('📡 Connexion au producteur Kafka...');
    await producer.connect();
    console.log('✅ Producteur Kafka connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion Kafka:', error);
    throw error;
  }
};

const sendMessage = async (message) => {
  try {
    await producer.send({
      topic: 'chat-room',
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log('📤 Message envoyé à Kafka:', message);
  } catch (error) {
    console.error('❌ Erreur lors de l’envoi du message:', error);
    throw error;
  }
};

module.exports = { producer, connectProducer, sendMessage };