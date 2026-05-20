// ==========================================
// controllers/notificationController.js - إدارة الإشعارات
// ==========================================

const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    الحصول على إشعارات المستخدم
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort('-createdAt')
    .limit(50); // إرجاع آخر 50 إشعار فقط

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc    تحديد إشعار كمقروء
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: Date.now() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'الإشعار غير موجود' });
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    تحديد جميع الإشعارات كمقروءة
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: Date.now() }
  );

  res.status(200).json({
    success: true,
    message: 'تم تحديد جميع الإشعارات كمقروءة',
  });
});
