// ==========================================
// middleware/authMiddleware.js - حماية المسارات بـ JWT
// ==========================================

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * protect - يتحقق من صحة JWT Token ويضيف بيانات المستخدم للـ request
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // استخراج التوكن من الـ Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // التحقق من وجود التوكن
  if (!token) {
    res.status(401);
    throw new Error('غير مصرح لك بالوصول، يرجى تسجيل الدخول أولاً');
  }

  try {
    // فك تشفير التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // جلب بيانات المستخدم من قاعدة البيانات
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('المستخدم غير موجود');
    }

    // التحقق من أن الحساب نشط
    if (!user.isActive) {
      res.status(403);
      throw new Error('حسابك معطل، يرجى التواصل مع الإدارة');
    }

    // إضافة بيانات المستخدم للـ request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('التوكن غير صالح');
    }
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً');
    }
    throw error;
  }
});

/**
 * optionalAuth - مصادقة اختيارية (لا يوقف الطلب إذا لم يوجد توكن)
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // تجاهل الخطأ في المصادقة الاختيارية
    }
  }

  next();
});

module.exports = { protect, optionalAuth };
