// ==========================================
// utils/generateToken.js - توليد رموز JWT
// ==========================================

const jwt = require('jsonwebtoken');

/**
 * generateToken - يولد توكن JWT للمستخدم
 * @param {ObjectId} id - معرف المستخدم
 * @returns {string} - JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * sendTokenResponse - يولد توكن ويرسله كـ Cookie وفي الاستجابة
 */
const sendTokenResponse = (user, statusCode, res) => {
  // توليد التوكن
  const token = generateToken(user._id);

  // إعداد خيارات الـ Cookie
  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // لمنع وصول JavaScript للـ Cookie (حماية من XSS)
    secure: process.env.NODE_ENV === 'production', // فقط عبر HTTPS في الإنتاج
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // للسماح للـ Frontend (Cross-Origin) بالوصول في الإنتاج
  };

  // إرسال الاستجابة مع البيانات الآمنة (بدون كلمة المرور)
  const userData = user.toSafeObject();

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userData,
    });
};

module.exports = { generateToken, sendTokenResponse };
