const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatController');
const auth = require('../middlewares/authMiddleware');

router.post('/send', auth(['patient']), controller.send);
router.get('/messages', auth(['patient']), controller.getAll);

module.exports = router;
