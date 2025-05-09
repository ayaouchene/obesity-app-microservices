const express = require('express');
  const connectDB = require('./config/db');
  const appointmentRoutes = require('./routes/appointment.routes');
  const assessmentRoutes = require('./routes/assessment.routes');
  const { initProducer } = require('./services/kafka.producer');

  const app = express();

  app.use(express.json());
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/assessments', assessmentRoutes);

  const PORT = process.env.PORT || 5001;

  const startServer = async () => {
    try {
      await connectDB();
      await initProducer();
      app.listen(PORT, () => {
        console.log(`🌐 Appointment Service running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Erreur lors du démarrage du serveur:', error);
      process.exit(1);
    }
  };

  startServer();