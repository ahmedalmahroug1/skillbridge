// ==========================================
// controllers/chatController.js - إدارة الدردشة
// ==========================================

const Chat = require('../models/Chat');
const Message = require('../models/Message');
const asyncHandler = require('express-async-handler');

// @desc    الحصول على جميع محادثات المستخدم
// @route   GET /api/chats
// @access  Private
exports.getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: { $in: [req.user._id] }
  })
    .populate('participants', 'name avatar')
    .populate({
      path: 'booking',
      select: 'status scheduledDate',
      populate: { path: 'service', select: 'title' }
    })
    .sort('-updatedAt');

  res.status(200).json({
    success: true,
    data: chats,
  });
});

// @desc    الحصول على رسائل محادثة معينة
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // التحقق من أن المستخدم مشارك في هذه المحادثة
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة' });
  }

  if (!chat.participants.includes(req.user._id)) {
    return res.status(403).json({ success: false, message: 'غير مصرح لك بمشاهدة هذه المحادثة' });
  }

  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name avatar')
    .sort('createdAt');

  // تصفير العداد للرسائل غير المقروءة لهذا المستخدم
  if (chat.unreadCount && chat.unreadCount.get(req.user._id.toString()) > 0) {
    chat.unreadCount.set(req.user._id.toString(), 0);
    await chat.save();
  }

  res.status(200).json({
    success: true,
    data: messages,
  });
});

// @desc    إرسال رسالة جديدة
// @route   POST /api/chats/:chatId/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content, type } = req.body;

  const chat = await Chat.findById(chatId);
  
  if (!chat) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة' });
  }

  if (!chat.participants.includes(req.user._id)) {
    return res.status(403).json({ success: false, message: 'غير مصرح لك بإرسال رسائل في هذه المحادثة' });
  }

  // إنشاء الرسالة
  const message = await Message.create({
    chat: chatId,
    sender: req.user._id,
    content,
    type: type || 'text',
  });

  // تحديد المستلم (الطرف الآخر في المحادثة)
  const receiverId = chat.participants.find(p => p.toString() !== req.user._id.toString());

  // تحديث بيانات المحادثة (الرسالة الأخيرة، وزيادة عداد غير المقروءة للطرف الآخر)
  chat.lastMessage = {
    content,
    sender: req.user._id,
    sentAt: Date.now()
  };
  
  const currentUnread = chat.unreadCount.get(receiverId.toString()) || 0;
  chat.unreadCount.set(receiverId.toString(), currentUnread + 1);
  
  await chat.save();

  // جلب الرسالة مع بيانات المرسل لإرسالها في الـ Response والـ Socket
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name avatar');

  // إرسال الرسالة عبر Socket.io إذا كان متاحاً
  const io = req.app.get('io');
  if (io) {
    // نرسلها للغرفة الخاصة بالمستلم
    io.to(receiverId.toString()).emit('message_received', {
      ...populatedMessage.toObject(),
      chat: { _id: chat._id, participants: chat.participants }
    });
  }

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});
