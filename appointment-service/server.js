const express = require('express');
const connectDB = require('./config/db');
const kafka = require('./config/kafka');
const { initProducer } = require('./services/kafka.producer');
const { initConsumer } = require('./services/kafka.consumer');
const appointmentRoutes = require('./routes/appointment.routes');
const assessmentRoutes = require('./routes/assessment.routes');

const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);
app.use('/api/assessments', assessmentRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await Promise.all([
      connectDB(),           // MongoDB
      initProducer(),        // Kafka Producer
      initConsumer()         // Kafka Consumer (si nécessaire)
    ]);
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Service démarré sur le port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Échec du démarrage:', error);
    process.exit(1);
  }
};

startServer();