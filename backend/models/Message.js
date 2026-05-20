// ==========================================
// models/Message.js - نموذج الرسائل
// ==========================================

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // المحادثة التي تنتمي إليها الرسالة
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },

    // المُرسِل
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // محتوى الرسالة
    content: {
      type: String,
      required: [true, 'محتوى الرسالة مطلوب'],
      maxlength: [1000, 'الرسالة لا يجب أن تتجاوز 1000 حرف'],
    },

    // نوع الرسالة
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },

    // مرفق صورة (اختياري)
    attachment: {
      url: { type: String },
      publicId: { type: String },
      name: { type: String },
    },

    // هل قُرأت الرسالة
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

messageSchema.index({ chat: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
