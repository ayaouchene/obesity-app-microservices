const Group = require('../models/group.model');
const Message = require('../models/message.model');
const PrivateChat = require('../models/privateChat.model');
const { sendNotification } = require('../utils/kafkaProducer');
const axios = require('axios');

const chatController = {
  async getGroups(req, res) {
    try {
      const groups = await Group.find();
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des groupes', error });
    }
  },

  async joinGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { userId, role } = req.user;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe non trouvé' });
      }

      if (group.members.some(member => member.userId === userId)) {
        return res.status(400).json({ message: 'Déjà membre du groupe' });
      }

      group.members.push({ userId, role });
      await group.save();

      await sendNotification({
        userId,
        type: 'email',
        content: `Vous avez rejoint le groupe ${group.name}.`,
      });

      res.status(200).json({ message: 'Groupe rejoint avec succès', group });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l’inscription au groupe', error });
    }
  },

  async leaveGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { userId } = req.user;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe non trouvé' });
      }

      group.members = group.members.filter(member => member.userId !== userId);
      await group.save();

      res.status(200).json({ message: 'Groupe quitté avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la sortie du groupe', error });
    }
  },

  async getGroupMessages(req, res) {
    try {
      const { groupId } = req.params;
      const messages = await Message.find({ groupId }).sort({ createdAt: 1 });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des messages', error });
    }
  },

  async sendGroupMessage(req, res) {
    try {
      const { groupId } = req.params;
      const { content } = req.body;
      const { userId, role } = req.user;

      if (!content) {
        return res.status(400).json({ message: 'Le contenu du message est requis' });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Groupe non trouvé' });
      }

      const isMember = group.members.some(member => member.userId === userId);
      if (!isMember) {
        return res.status(403).json({ message: 'Vous devez rejoindre le groupe pour envoyer un message' });
      }

      const message = new Message({
        senderId: userId,
        senderRole: role,
        content,
        groupId,
        timestamp: new Date()
      });

      await message.save();

      res.status(201).json({
        message: 'Message envoyé avec succès',
        messageId: message._id
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async startPrivateChat(req, res) {
    console.log('Corps de la requête reçu :', req.body);
    console.log('Utilisateur authentifié :', req.user);
    try {
      const { doctorId } = req.body;
      const { userId } = req.user;

      // Vérifier que doctorId est fourni
      if (!doctorId) {
        return res.status(400).json({ message: 'doctorId est requis' });
      }

      // Vérifier que le médecin existe via une requête à auth-service
      console.log('Recherche du médecin avec userId :', doctorId);
      let doctor;
      try {
        const response = await axios.get(`http://auth-service:5000/api/users/${doctorId}`, {
          headers: { Authorization: `Bearer ${req.header('Authorization')?.replace('Bearer ', '')}` },
        });
        doctor = response.data;
        if (doctor.role !== 'doctor') {
          return res.status(404).json({ message: 'Utilisateur spécifié n’est pas un médecin' });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du médecin :', error.message);
        return res.status(404).json({ message: 'Médecin non trouvé' });
      }

      // Vérifier si un chat existe déjà
      console.log('Vérification chat existant pour patientId :', userId, 'et doctorId :', doctorId);
      const existingChat = await PrivateChat.findOne({ patientId: userId, doctorId });
      if (existingChat) {
        return res.status(400).json({ message: 'Conversation déjà existante' });
      }

      // Créer un nouveau chat privé
      console.log('Création du chat privé avec patientId :', userId, 'et doctorId :', doctorId);
      const privateChat = new PrivateChat({ patientId: userId, doctorId });
      await privateChat.save();

      // Envoyer une notification
      console.log('Envoi de la notification à doctorId :', doctorId);
      await sendNotification({
        userId: doctorId,
        type: 'email',
        content: `Un patient (${userId}) souhaite démarrer une conversation privée avec vous.`,
      });

      res.status(201).json(privateChat);
    } catch (error) {
      console.error('Erreur dans startPrivateChat :', error);
      res.status(500).json({ message: 'Erreur lors de la création du chat privé', error: error.message });
    }
  },

  async acceptPrivateChat(req, res) {
    try {
      const { chatId } = req.params;

      const privateChat = await PrivateChat.findById(chatId);
      if (!privateChat) {
        return res.status(404).json({ message: 'Chat non trouvé' });
      }

      privateChat.status = 'accepted';
      await privateChat.save();

      res.status(200).json({ message: 'Chat accepté', privateChat });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l’acceptation du chat', error });
    }
  },

  async getPrivateChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const messages = await Message.find({ privateChatId: chatId }).sort({ createdAt: 1 });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des messages', error });
    }
  },
  async sendPrivateMessage(req, res) {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      const { userId, role } = req.user;

      if (!content) {
        return res.status(400).json({ message: 'Le contenu du message est requis' });
      }

      const privateChat = await PrivateChat.findById(chatId);
      if (!privateChat) {
        return res.status(404).json({ message: 'Chat privé non trouvé' });
      }

      // Vérifier que l'utilisateur est autorisé (patient ou médecin du chat)
      if (privateChat.patientId !== userId && privateChat.doctorId !== userId) {
        return res.status(403).json({ message: 'Vous n’êtes pas autorisé à envoyer un message dans ce chat' });
      }

      // Vérifier que le chat est accepté
      if (privateChat.status !== 'accepted') {
        return res.status(403).json({ message: 'Le chat doit être accepté avant d’envoyer des messages' });
      }

      const message = new Message({
        senderId: userId,
        senderRole: role,
        content,
        privateChatId: chatId,
        timestamp: new Date()
      });

      await message.save();

      // Émettre le message via Socket.IO
      const io = req.app.get('io'); // Récupérer l'instance de Socket.IO
      io.to(`chat:${chatId}`).emit('privateMessage', message);

      // Envoyer une notification au destinataire
      const recipientId = privateChat.patientId === userId ? privateChat.doctorId : privateChat.patientId;
      await sendNotification({
        userId: recipientId,
        type: 'email',
        content: `Nouveau message privé de ${userId}: ${content}`,
      });

      res.status(201).json({
        message: 'Message envoyé avec succès',
        messageId: message._id
      });
    } catch (error) {
      console.error('Erreur dans sendPrivateMessage :', error);
      res.status(500).json({ message: 'Erreur lors de l’envoi du message', error: error.message });
    }
  },
};

module.exports = chatController;
