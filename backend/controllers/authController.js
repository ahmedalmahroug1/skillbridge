// ==========================================
// controllers/authController.js - وحدات التحكم الخاصة بالمصادقة
// ==========================================

const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { sendTokenResponse } = require('../utils/generateToken');

// @desc    تسجيل مستخدم جديد
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // التحقق من أن الدور ليس مدير (المدير يتم إنشاؤه من الإدارة فقط)
  if (role === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'لا يمكن التسجيل كمدير مباشرة',
    });
  }

  // التحقق مما إذا كان المستخدم موجوداً مسبقاً
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'البريد الإلكتروني مسجل بالفعل',
    });
  }

  // إنشاء المستخدم
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'client', // الافتراضي هو عميل
  });

  // إرسال التوكن في الاستجابة
  sendTokenResponse(user, 201, res);
});

// @desc    تسجيل الدخول
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // التحقق من إدخال البريد وكلمة المرور
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
    });
  }

  // البحث عن المستخدم وتضمين حقل كلمة المرور (لأنه select: false في الموديل)
  // ونقوم بجلب بيانات الـ providerProfile إذا كان مقدم خدمة
  const user = await User.findOne({ email }).select('+password').populate('providerProfile');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'بيانات الدخول غير صحيحة',
    });
  }

  // التحقق من حالة الحساب
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'هذا الحساب معطل، يرجى التواصل مع الدعم الفني',
    });
  }

  // مقارنة كلمة المرور
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'بيانات الدخول غير صحيحة',
    });
  }

  // تحديث تاريخ آخر تسجيل دخول
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // إرسال التوكن
  sendTokenResponse(user, 200, res);
});

// @desc    تسجيل الخروج
// @route   POST /api/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // انتهاء صلاحية الكوكي بعد 10 ثوانٍ
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح',
  });
});

// @desc    الحصول على بيانات المستخدم الحالي (عن طريق التوكن)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  // المستخدم متاح في req.user بفضل الـ authMiddleware
  // نقوم بجلب بيانات مقدم الخدمة الإضافية إذا كان دوره provider
  let userQuery = User.findById(req.user._id);
  
  if (req.user.role === 'provider') {
    userQuery = userQuery.populate('providerProfile');
  }
  
  const user = await userQuery;

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    تحديث كلمة المرور
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // جلب المستخدم مع كلمة المرور
  const user = await User.findById(req.user._id).select('+password');

  // التحقق من كلمة المرور الحالية
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'كلمة المرور الحالية غير صحيحة',
    });
  }

  // تعيين كلمة المرور الجديدة
  user.password = newPassword;
  await user.save();

  // إرسال توكن جديد لتجديد الجلسة
  sendTokenResponse(user, 200, res);
});
