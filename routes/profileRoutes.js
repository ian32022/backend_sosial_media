const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { validateUpdateProfile } = require('../middlewares/validateMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.get('/', verifyToken, getProfile);
router.put('/', verifyToken, validateUpdateProfile, updateProfile);

module.exports = router;
