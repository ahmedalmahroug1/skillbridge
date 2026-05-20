// ==========================================
// models/Booking.js - نموذج الحجز
// ==========================================

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // العميل
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // مقدم الخدمة
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },

    // الخدمة المطلوبة
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false, // اختياري - قد يكون طلب مباشر
    },

    // حالة الحجز
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
        message: 'حالة الحجز غير صالحة',
      },
      default: 'pending',
    },

    // التاريخ المحدد للخدمة
    scheduledDate: {
      type: Date,
      required: [true, 'تاريخ الخدمة مطلوب'],
    },

    // الوقت المحدد
    scheduledTime: {
      type: String,
      required: [true, 'وقت الخدمة مطلوب'],
    },

    // موقع تقديم الخدمة
    location: {
      address: { type: String, required: [true, 'العنوان مطلوب'] },
      city: { type: String, required: [true, 'المدينة مطلوبة'] },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    // وصف المشكلة / طلب الخدمة
    description: {
      type: String,
      required: [true, 'وصف الطلب مطلوب'],
      maxlength: [500, 'الوصف لا يجب أن يتجاوز 500 حرف'],
    },

    // السعر الإجمالي المتفق عليه
    totalPrice: {
      type: Number,
      min: [0, 'السعر لا يمكن أن يكون سالباً'],
    },

    // ملاحظات
    clientNotes: { type: String, maxlength: [300, 'الملاحظات لا يجب أن تتجاوز 300 حرف'] },
    providerNotes: { type: String, maxlength: [300, 'الملاحظات لا يجب أن تتجاوز 300 حرف'] },

    // سبب الرفض أو الإلغاء
    rejectionReason: { type: String },
    cancellationReason: { type: String },

    // تواريخ تغيير الحالة
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },

    // هل تم تقييم هذا الحجز
    isReviewed: {
      type: Boolean,
      default: false,
    },

    // الدردشة المرتبطة
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes للاستعلامات الشائعة
bookingSchema.index({ client: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual: هل الحجز متأخر
bookingSchema.virtual('isOverdue').get(function () {
  return this.status === 'accepted' && this.scheduledDate < new Date();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
