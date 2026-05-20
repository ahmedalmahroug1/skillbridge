// ==========================================
// controllers/adminController.js - لوحة تحكم الإدارة
// ==========================================

const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const asyncHandler = require('express-async-handler');

// @desc    الحصول على إحصائيات عامة للمنصة
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
exports.getPlatformStats = asyncHandler(async (req, res) => {
  // استخدام Promise.all لتنفيذ الاستعلامات بشكل متوازٍ
  const [
    totalUsers,
    totalProviders,
    totalServices,
    totalBookings,
    pendingBookings,
    completedBookings,
    revenue
  ] = await Promise.all([
    User.countDocuments({ role: 'client' }),
    User.countDocuments({ role: 'provider' }),
    Service.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'completed' }),
    // حساب الإيرادات الإجمالية للمنصة (بافتراض نسبة عمولة 10%)
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
  ]);

  const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
  const platformProfit = totalRevenue * 0.10; // 10% عمولة

  res.status(200).json({
    success: true,
    data: {
      users: totalUsers,
      providers: totalProviders,
      services: totalServices,
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings
      },
      financials: {
        totalTransactionVolume: totalRevenue,
        platformRevenue: platformProfit
      }
    }
  });
});

// @desc    الحصول على جميع المستخدمين (مع فلترة)
// @route   GET /api/admin/users
// @access  Private (Admin Only)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const query = {};
  
  if (req.query.role) query.role = req.query.role;
  if (req.query.isActive !== undefined) query.isActive = req.query.isActive;

  const users = await User.find(query).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    تغيير حالة حساب المستخدم (تفعيل/تعطيل)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin Only)
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  }

  // لا يمكن تعطيل حساب المدير الرئيسي نفسه
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'لا يمكنك تغيير حالة حسابك الخاص' });
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `تم ${user.isActive ? 'تفعيل' : 'تعطيل'} حساب المستخدم بنجاح`,
    data: user
  });
});

// @desc    التحقق من/توثيق مقدم خدمة
// @route   PUT /api/admin/providers/:id/verify
// @access  Private (Admin Only)
exports.verifyProvider = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id);

  if (!provider) {
    return res.status(404).json({ success: false, message: 'مقدم الخدمة غير موجود' });
  }

  provider.isVerified = !provider.isVerified;
  await provider.save();

  // إرسال إشعار
  if (provider.isVerified) {
    const io = req.app.get('io');
    const Notification = require('../models/Notification');
    
    await Notification.createAndSend(io, {
      recipient: provider.user,
      type: 'provider_verified',
      title: 'توثيق الحساب',
      message: 'تهانينا! لقد تم توثيق حسابك كمقدم خدمة معتمد في المنصة.',
    });
  }

  res.status(200).json({
    success: true,
    message: `تم ${provider.isVerified ? 'توثيق' : 'إلغاء توثيق'} مقدم الخدمة`,
    data: provider
  });
});
