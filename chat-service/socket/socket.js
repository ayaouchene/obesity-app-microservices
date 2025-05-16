const jwt = require('jsonwebtoken');
const Message = require('../models/message.model');
const { sendNotification } = require('../utils/kafkaProducer');

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.userId} connected`);

    socket.on('joinGroup', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('joinPrivateChat', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('sendGroupMessage', async ({ groupId, content }) => {
      const message = new Message({
        senderId: socket.user.userId,
        senderRole: socket.user.role,
        content,
        groupId,
      });
      await message.save();
      io.to(`group:${groupId}`).emit('groupMessage', message);

      const group = await require('../models/group.model').findById(groupId);
      for (const member of group.members) {
        if (member.userId !== socket.user.userId) {
          await sendNotification({
            userId: member.userId,
            type: 'email',
            content: `Nouveau message dans le groupe ${group.name}: ${content}`,
          });
        }
      }
    });

    socket.on('sendPrivateMessage', async ({ chatId, content }) => {
      const message = new Message({
        senderId: socket.user.userId,
        senderRole: socket.user.role,
        content,
        privateChatId: chatId,
      });
      await message.save();
      io.to(`chat:${chatId}`).emit('privateMessage', message);

      const privateChat = await require('../models/privateChat.model').findById(chatId);
      const recipientId = privateChat.patientId === socket.user.userId ? privateChat.doctorId : privateChat.patientId;
      await sendNotification({
        userId: recipientId,
        type: 'email',
        content: `Nouveau message privé: ${content}`,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.userId} disconnected`);
    });
  });
};

module.exports = setupSocket;