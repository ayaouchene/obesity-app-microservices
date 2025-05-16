const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/groups', authMiddleware, chatController.getGroups);
router.post('/groups/:groupId/join', authMiddleware, chatController.joinGroup);
router.post('/groups/:groupId/leave', authMiddleware, chatController.leaveGroup);
router.get('/groups/:groupId/messages', authMiddleware, chatController.getGroupMessages);
router.post('/groups/:groupId/messages', authMiddleware, chatController.sendGroupMessage); // Nouvelle route
router.post('/private/start', authMiddleware, chatController.startPrivateChat);
router.post('/private/:chatId/accept', authMiddleware, chatController.acceptPrivateChat);
router.get('/private/:chatId/messages', authMiddleware, chatController.getPrivateChatMessages);
router.post('/private/:chatId/messages', authMiddleware, chatController.sendPrivateMessage);

module.exports = router;