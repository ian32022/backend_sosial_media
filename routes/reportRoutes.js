const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { createReport, getReports, resolveReport, moderatePost } = require('../controllers/reportController');

router.post('/posts/:id/report', verifyToken, createReport);
router.get('/reports', verifyToken, roleMiddleware(['admin', 'moderator']), getReports);
router.put('/reports/:id/resolve', verifyToken, roleMiddleware(['admin', 'moderator']), resolveReport);
router.put('/posts/:id/moderate', verifyToken, roleMiddleware(['admin', 'moderator']), moderatePost);

module.exports = router;
