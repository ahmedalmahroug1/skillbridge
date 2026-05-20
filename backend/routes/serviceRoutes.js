// ==========================================
// routes/serviceRoutes.js - مسارات الخدمات
// ==========================================

const express = require('express');
const router = express.Router();

const {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

const { protect, isProvider } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// المسارات العامة
router.route('/')
  .get(getServices)
  .post(protect, authorize('provider', 'admin'), createService);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('provider', 'admin'), updateService)
  .delete(protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
