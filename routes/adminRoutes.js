const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

router.get('/dashboard', verifyToken, roleMiddleware(['admin']), getDashboard);

module.exports = router;
