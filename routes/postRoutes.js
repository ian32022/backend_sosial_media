const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { validatePost } = require('../middlewares/validateMiddleware');
const {
  createPost, getPosts, getPostById, updatePost, deletePost, hidePost
} = require('../controllers/postController');

router.post('/', verifyToken, validatePost, createPost);
router.get('/', verifyToken, getPosts);
router.get('/:id', verifyToken, getPostById);
router.put('/:id', verifyToken, validatePost, updatePost);
router.delete('/:id', verifyToken, deletePost);
router.put('/:id/hide', verifyToken, roleMiddleware(['admin', 'moderator']), hidePost);

module.exports = router;
