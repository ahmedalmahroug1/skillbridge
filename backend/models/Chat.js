// ==========================================
// models/Chat.js - نموذج محادثة الدردشة
// ==========================================

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    // المشاركون في المحادثة (عميل + مقدم خدمة)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // الحجز المرتبط بالمحادثة (اختياري)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },

    // آخر رسالة (للعرض في قائمة المحادثات)
    lastMessage: {
      content: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date, default: Date.now },
    },

    // عدد الرسائل غير المقروءة لكل مشارك
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual: الرسائل المرتبطة
chatSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chat',
});

chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
