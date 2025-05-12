const { Kafka } = require('kafkajs');
const Slot = require('../models/slot.model');

const kafka = new Kafka({
  clientId: 'appointment-service',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'appointment-service-group' });

const initConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Consommateur Kafka connecté');

    await consumer.subscribe({ topic: 'availability_updated', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        console.log(`Message reçu sur ${topic}:`, data);

        if (topic === 'availability_updated') {
          const { doctorId, availability } = data;

          // Supprimer les anciens slots du médecin
          await Slot.deleteMany({ doctorId });

          // Créer de nouveaux slots basés sur les disponibilités
          const slots = [];
          const startDate = new Date('2025-05-12'); // Date de début (lundi)
          const daysMap = {
            Monday: 0,
            Tuesday: 1,
            Wednesday: 2,
            Thursday: 3,
            Friday: 4,
            Saturday: 5,
            Sunday: 6,
          };

          availability.forEach(({ day, startTime, endTime }) => {
            const dayOffset = daysMap[day];
            const slotDate = new Date(startDate);
            slotDate.setDate(startDate.getDate() + dayOffset);

            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);

            let currentTime = new Date(slotDate);
            currentTime.setHours(startHour, startMinute, 0, 0);

            const endTimeDate = new Date(slotDate);
            endTimeDate.setHours(endHour, endMinute, 0, 0);

            while (currentTime < endTimeDate) {
              const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30 minutes slots
              if (slotEnd > endTimeDate) break;

              slots.push({
                doctorId,
                startTime: new Date(currentTime),
                endTime: slotEnd,
                isAvailable: true,
                createdAt: new Date(),
              });

              currentTime = slotEnd;
            }
          });

          await Slot.insertMany(slots);
          console.log(`Slots mis à jour pour le médecin ${doctorId}`);
        }
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du consommateur Kafka:', error);
  }
};

module.exports = { initConsumer };