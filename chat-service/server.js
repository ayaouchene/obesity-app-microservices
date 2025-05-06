const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { producer, connectProducer, sendMessage } = require('./kafka/producer');
const { connectConsumer, runConsumer } = require('./kafka/consumer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5002;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Connexion à MongoDB
const connectMongoDB = async () => {
  try {
    console.log('📡 Connexion à MongoDB:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/chatdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    throw error;
  }
};

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

// Modèle MongoDB pour les messages
const messageSchema = new mongoose.Schema({
  text: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// Endpoint pour envoyer un message
app.post('/api/chat/send', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Texte requis' });

    const message = { text, userId: req.user.id, timestamp: new Date() };
    await sendMessage(message);
    const savedMessage = new Message(message);
    await savedMessage.save();
    res.status(200).json({ message: 'Message envoyé' });
  } catch (error) {
    console.error('❌ Erreur lors de l’envoi du message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer les messages
app.get('/api/chat/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    res.status(200).json(messages);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrage du serveur
const startServer = async () => {
  try {
    await connectMongoDB();
    await connectProducer();
    await connectConsumer();
    await runConsumer(async (message) => {
      console.log('📥 Traitement du message:', message);
      const savedMessage = new Message(message);
      await savedMessage.save();
    });

    app.listen(PORT, () => {
      console.log(`💬 Chat Service sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
    process.exit(1);
  }
};

startServer();