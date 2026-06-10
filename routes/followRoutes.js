const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { toggleFollow, getFollowers, getFollowing } = require('../controllers/followController');

router.post('/users/:id/follow', verifyToken, toggleFollow);
router.get('/users/:id/followers', verifyToken, getFollowers);
router.get('/users/:id/following', verifyToken, getFollowing);

module.exports = router;
