const { Kafka } = require('kafkajs');

  const kafka = new Kafka({
    clientId: 'appointment-service',
    brokers: ['kafka:9092'],
  });

  module.exports = kafka;