const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');

router.post('/', followController.followUser);
router.delete('/:userId', followController.unfollowUser);
router.get('/', followController.getFollowedUsers);

module.exports = router;