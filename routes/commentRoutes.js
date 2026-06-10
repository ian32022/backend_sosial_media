const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { validateComment } = require('../middlewares/validateMiddleware');
const { addComment, getComments, updateComment, deleteComment } = require('../controllers/commentController');

router.post('/posts/:id/comments', verifyToken, validateComment, addComment);
router.get('/posts/:id/comments', verifyToken, getComments);
router.put('/comments/:id', verifyToken, validateComment, updateComment);
router.delete('/comments/:id', verifyToken, deleteComment);

module.exports = router;
