// ==========================================
// routes/adminRoutes.js - مسارات الإدارة
// ==========================================

const express = require('express');
const router = express.Router();

const {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  verifyProvider
} = require('../controllers/adminController');

const { protect, isAdmin } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// جميع مسارات الإدارة تتطلب مصادقة وصلاحيات مدير
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.put('/providers/:id/verify', verifyProvider);

module.exports = router;
