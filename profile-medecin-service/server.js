const express = require('express');
const mongoose = require('./config/mongoose');
const kafka = require('./config/kafka');
const { initProducer } = require('./services/kafka.producer');
const { initConsumer } = require('./services/kafka.consumer');
const postRoutes = require('./routes/post.routes');
const profileRoutes = require('./routes/profile.routes');
const followRoutes = require('./routes/follow.routes');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use('/api/posts', authMiddleware.verifyToken, postRoutes);
app.use('/api/profile', authMiddleware.verifyToken, profileRoutes);
app.use('/api/follow', authMiddleware.verifyToken, followRoutes);

const PORT = process.env.PORT || 5003;

mongoose.connect().then(() => {
  console.log('Connecté à MongoDB');
  kafka.connect().then(() => {
    console.log('Connecté à Kafka');
    initProducer().then(() => {
      console.log('Producteur Kafka initialisé');
      initConsumer().then(() => {
        console.log('Consommateur Kafka initialisé');
        app.listen(PORT, () => {
          console.log(`Profile-Medecin-Service démarré sur le port ${PORT}`);
        });
      });
    });
  });
}).catch(err => console.error('Erreur de connexion:', err));

module.exports = app;