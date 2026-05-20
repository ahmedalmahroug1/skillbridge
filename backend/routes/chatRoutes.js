// ==========================================
// routes/chatRoutes.js - مسارات الدردشة
// ==========================================

const express = require('express');
const router = express.Router();
const { getChats, getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getChats);

router.route('/:chatId/messages')
  .get(getMessages)
  .post(sendMessage);

module.exports = router;
