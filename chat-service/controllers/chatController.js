const sendMessage = require('../kafka/producer');
const Message = require('../models/Message');

exports.send = async (req, res) => {
  const { text } = req.body;

  const message = {
    senderId: req.user.id,
    senderName: req.user.name,
    text,
  };

  await sendMessage(message);
  res.status(200).json({ message: 'Message envoyé' });
};

exports.getAll = async (req, res) => {
  const messages = await Message.find().sort({ sentAt: 1 });
  res.status(200).json(messages);
};
