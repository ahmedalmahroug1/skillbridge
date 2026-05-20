// ==========================================
// routes/userRoutes.js - مسارات المستخدمين
// ==========================================

const express = require('express');
const router = express.Router();

const {
  updateProfile,
  updateAvatar,
  becomeProvider,
  getProviderProfile,
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

// المسارات العامة
router.get('/provider/:id', getProviderProfile);

// المسارات المحمية
router.use(protect); // حماية كل المسارات القادمة

router.put('/profile', updateProfile);
router.post('/avatar', updateAvatar);
router.post('/become-provider', becomeProvider);

module.exports = router;
