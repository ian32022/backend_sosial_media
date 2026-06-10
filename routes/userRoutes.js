const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { getAllUsers, getUserById, updateUserRole, deleteUser } = require('../controllers/userController');

router.get('/users', verifyToken, roleMiddleware(['admin']), getAllUsers);
router.get('/users/:id', verifyToken, roleMiddleware(['admin', 'moderator']), getUserById);
router.put('/users/:id/role', verifyToken, roleMiddleware(['admin']), updateUserRole);
router.delete('/users/:id', verifyToken, roleMiddleware(['admin']), deleteUser);

module.exports = router;
