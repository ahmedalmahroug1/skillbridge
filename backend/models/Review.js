// ==========================================
// models/Review.js - نموذج التقييم
// ==========================================

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // الحجز المرتبط بالتقييم
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },

    // العميل الذي قدم التقييم
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // مقدم الخدمة الذي يتم تقييمه
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },

    // التقييم بالنجوم (1-5)
    rating: {
      type: Number,
      required: [true, 'التقييم مطلوب'],
      min: [1, 'التقييم الأدنى هو 1'],
      max: [5, 'التقييم الأعلى هو 5'],
    },

    // التعليق
    comment: {
      type: String,
      required: [true, 'التعليق مطلوب'],
      minlength: [10, 'التعليق يجب أن يكون على الأقل 10 أحرف'],
      maxlength: [500, 'التعليق لا يجب أن يتجاوز 500 حرف'],
    },

    // هل التقييم موثوق (من عميل حقيقي أكمل الحجز)
    isVerified: {
      type: Boolean,
      default: true,
    },

    // رد مقدم الخدمة على التقييم
    providerReply: {
      type: String,
      maxlength: [300, 'الرد لا يجب أن يتجاوز 300 حرف'],
    },

    providerReplyDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// لا يُسمح بتقييم واحد أكثر من مرة لنفس الحجز
reviewSchema.index({ booking: 1, client: 1 }, { unique: true });
reviewSchema.index({ provider: 1 });
reviewSchema.index({ rating: -1 });

// ==========================================
// Static Method: حساب متوسط تقييم مقدم الخدمة
// ==========================================
reviewSchema.statics.calcAvgRating = async function (providerId) {
  const stats = await this.aggregate([
    { $match: { provider: providerId } },
    {
      $group: {
        _id: '$provider',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('ServiceProvider').findByIdAndUpdate(providerId, {
      avgRating: stats[0].avgRating,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model('ServiceProvider').findByIdAndUpdate(providerId, {
      avgRating: 0,
      totalReviews: 0,
    });
  }
};

// تحديث متوسط التقييم بعد كل تقييم جديد
reviewSchema.post('save', function () {
  this.constructor.calcAvgRating(this.provider);
});

// تحديث متوسط التقييم بعد حذف تقييم
reviewSchema.post('remove', function () {
  this.constructor.calcAvgRating(this.provider);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
