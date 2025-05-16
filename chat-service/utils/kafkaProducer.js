const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'chat-service',
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

const sendNotification = async (notification) => {
  await producer.connect();
  await producer.send({
    topic: 'notifications',
    messages: [{ value: JSON.stringify(notification) }],
  });
  await producer.disconnect();
};

module.exports = { sendNotification };