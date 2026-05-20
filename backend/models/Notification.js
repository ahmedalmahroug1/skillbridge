// ==========================================
// models/Notification.js - نموذج الإشعارات
// ==========================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // المستلم
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // نوع الإشعار
    type: {
      type: String,
      required: true,
      enum: [
        'booking_new',        // حجز جديد
        'booking_accepted',   // قبول الحجز
        'booking_rejected',   // رفض الحجز
        'booking_completed',  // اكتمال الحجز
        'booking_cancelled',  // إلغاء الحجز
        'review_new',         // تقييم جديد
        'message_new',        // رسالة جديدة
        'provider_verified',  // تم التحقق من الحساب
        'system',             // إشعار النظام
      ],
    },

    // عنوان الإشعار
    title: {
      type: String,
      required: true,
    },

    // محتوى الإشعار
    message: {
      type: String,
      required: true,
    },

    // بيانات إضافية (مثل ID الحجز أو المحادثة)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // هل قُرأ الإشعار
    isRead: {
      type: Boolean,
      default: false,
    },

    // تاريخ القراءة
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// دالة static لإنشاء إشعار وإرساله عبر Socket.io
notificationSchema.statics.createAndSend = async function (io, notificationData) {
  const notification = await this.create(notificationData);

  // إرسال الإشعار في الوقت الفعلي عبر Socket.io
  if (io) {
    io.to(notificationData.recipient.toString()).emit('new_notification', notification);
  }

  return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
