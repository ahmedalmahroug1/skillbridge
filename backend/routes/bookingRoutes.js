// ==========================================
// routes/bookingRoutes.js - مسارات الحجوزات
// ==========================================

const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

// جميع مسارات الحجوزات محمية
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
