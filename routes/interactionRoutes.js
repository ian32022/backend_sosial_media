const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  toggleLike, toggleBookmark, getBookmarks
} = require('../controllers/interactionController');

router.post('/posts/:id/like', verifyToken, toggleLike);
router.post('/posts/:id/bookmark', verifyToken, toggleBookmark);
router.get('/bookmarks', verifyToken, getBookmarks);

module.exports = router;
