// ==========================================
// routes/reviewRoutes.js - مسارات التقييمات
// ==========================================

const express = require('express');
const router = express.Router();

const {
  createReview,
  getProviderReviews,
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

router.get('/provider/:providerId', getProviderReviews);
router.post('/', protect, createReview);

module.exports = router;
