const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { getFeed, getRankedFeed } = require('../controllers/feedController');

router.get('/', verifyToken, getFeed);
router.get('/ranked', verifyToken, getRankedFeed);

module.exports = router;
