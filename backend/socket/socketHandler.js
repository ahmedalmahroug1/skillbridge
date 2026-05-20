// ==========================================
// socket/socketHandler.js - إدارة اتصالات Socket.io للدردشة والإشعارات
// ==========================================

const Message = require('../models/Message');
const Chat = require('../models/Chat');

const socketHandler = (io) => {
  // تخزين تعيينات معرف المستخدم إلى معرف الـ Socket
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 مستخدم جديد متصل: ${socket.id}`);

    // ==========================================
    // 1. تسجيل اتصال المستخدم (Auth)
    // ==========================================
    socket.on('setup', (userId) => {
      if (!userId) return;
      
      socket.join(userId);
      userSockets.set(userId, socket.id);
      
      // إرسال حالة "متصل" للآخرين (يمكن استخدامها لاحقاً لعلامة "Online")
      socket.broadcast.emit('user_online', userId);
      
      socket.emit('connected');
      console.log(`👤 المستخدم ${userId} انضم لغرفته الخاصة`);
    });

    // ==========================================
    // 2. الانضمام إلى غرفة محادثة (Chat Room)
    // ==========================================
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`💬 المستخدم انضم للمحادثة: ${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      console.log(`💬 المستخدم غادر المحادثثة: ${chatId}`);
    });

    // ==========================================
    // 3. إرسال واستقبال الرسائل
    // ==========================================
    socket.on('new_message', async (messageData) => {
      // رسالة جديدة تصل من العميل
      // messageData تحتوي على: chatId, senderId, content, الخ
      
      const { chat } = messageData;
      
      if (!chat || !chat.participants) {
        return console.log('❌ خطأ: لم يتم تمرير بيانات المحادثة أو المشاركين مع الرسالة');
      }

      // إرسال الرسالة لجميع المشاركين باستثناء المرسل
      chat.participants.forEach((participantId) => {
        // تخطي المرسل
        if (participantId === messageData.sender._id || participantId === messageData.sender) {
          return;
        }

        // إرسال الرسالة إلى غرفة المستخدم المستلم
        socket.in(participantId).emit('message_received', messageData);
      });
    });

    // ==========================================
    // 4. مؤشرات الكتابة (Typing Indicators)
    // ==========================================
    socket.on('typing', (data) => {
      // data: { chatId, senderId }
      socket.in(data.chatId).emit('user_typing', data);
    });

    socket.on('stop_typing', (data) => {
      socket.in(data.chatId).emit('user_stopped_typing', data);
    });

    // ==========================================
    // 5. الانقطاع عن الاتصال
    // ==========================================
    socket.on('disconnect', () => {
      console.log(`🔌 مستخدم غادر: ${socket.id}`);
      
      // العثور على userId وإزالته (يتطلب بحث في الخريطة)
      let disconnectedUserId = null;
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        // إبلاغ الآخرين بأنه "غير متصل"
        socket.broadcast.emit('user_offline', disconnectedUserId);
      }
    });
  });
};

module.exports = socketHandler;
