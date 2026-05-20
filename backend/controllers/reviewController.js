// ==========================================
// controllers/reviewController.js - إدارة التقييمات
// ==========================================

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    إضافة تقييم جديد
// @route   POST /api/reviews
// @access  Private (Client Only)
exports.createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  // 1. التحقق من الحجز
  const booking = await Booking.findById(bookingId).populate('provider');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'الحجز غير موجود' });
  }

  // 2. التحقق من أن المستخدم هو صاحب الحجز
  if (booking.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'غير مصرح لك بتقييم هذا الحجز' });
  }

  // 3. التحقق من أن الحجز مكتمل (أو حسب سياسة المنصة)
  if (booking.status !== 'completed') {
    return res.status(400).json({ success: false, message: 'لا يمكن تقييم خدمة لم تكتمل بعد' });
  }

  // 4. التحقق من عدم وجود تقييم مسبق
  if (booking.isReviewed) {
    return res.status(400).json({ success: false, message: 'لقد قمت بتقييم هذه الخدمة مسبقاً' });
  }

  // 5. إنشاء التقييم
  const review = await Review.create({
    booking: bookingId,
    client: req.user._id,
    provider: booking.provider._id,
    rating,
    comment,
    isVerified: true, // لأن التقييم جاء من حجز فعلي عبر المنصة
  });

  // تحديث حالة الحجز
  booking.isReviewed = true;
  await booking.save();

  // 6. إرسال إشعار لمقدم الخدمة
  const io = req.app.get('io');
  await Notification.createAndSend(io, {
    recipient: booking.provider.user,
    type: 'review_new',
    title: 'تقييم جديد',
    message: `لقد حصلت على تقييم جديد (${rating} نجوم) من ${req.user.name}`,
    data: { reviewId: review._id },
  });

  res.status(201).json({
    success: true,
    message: 'تم إضافة التقييم بنجاح',
    data: review,
  });
});

// @desc    الحصول على تقييمات مقدم خدمة
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ provider: req.params.providerId })
    .populate({
      path: 'client',
      select: 'name avatar',
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});
