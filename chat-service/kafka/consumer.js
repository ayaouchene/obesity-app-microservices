const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'chat-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

const consumer = kafka.consumer({ groupId: 'chat-group' });

const connectConsumer = async () => {
  try {
    console.log('📡 Connexion au consommateur Kafka...');
    await consumer.connect();
    await consumer.subscribe({ topic: 'chat-room', fromBeginning: true });
    console.log('✅ Consommateur Kafka connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion Kafka:', error);
    throw error;
  }
};

const runConsumer = async (onMessage) => {
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value.toString();
      console.log('📥 Message reçu de Kafka:', value);
      onMessage(JSON.parse(value));
    },
  });
};

module.exports = { consumer, connectConsumer, runConsumer };