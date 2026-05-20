// ==========================================
// routes/authRoutes.js - مسارات المصادقة
// ==========================================

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// المسارات العامة (Public)
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// المسارات المحمية (Private)
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;
