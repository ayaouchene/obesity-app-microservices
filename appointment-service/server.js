const express = require('express');
const connectDB = require('./config/db');
const appointmentRoutes = require('./routes/appointment.routes');
const assessmentRoutes = require('./routes/assessment.routes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/assessments', assessmentRoutes);

// Connexion à MongoDB et démarrage du serveur
const PORT = process.env.PORT || 5001;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🌐 Appointment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur au démarrage du serveur', error);
    process.exit(1);
  }
};

startServer();