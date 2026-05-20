// ==========================================
// middleware/errorMiddleware.js - معالجة الأخطاء
// ==========================================

/**
 * notFound - معالجة المسارات غير الموجودة
 */
const notFound = (req, res, next) => {
  const error = new Error(`المسار غير موجود: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * errorHandler - معالج الأخطاء العام
 */
const errorHandler = (err, req, res, next) => {
  // تحديد كود الحالة (إذا كان 200، غيّره لـ 500)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // معالجة خطأ CastError (ObjectId خاطئ في MongoDB)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'المورد المطلوب غير موجود';
  }

  // معالجة خطأ التكرار (Duplicate Key)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `هذا ${field === 'email' ? 'البريد الإلكتروني' : field} مستخدم بالفعل`;
  }

  // معالجة أخطاء التحقق من البيانات (Validation)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // معالجة خطأ JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'التوكن غير صالح';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'انتهت صلاحية الجلسة';
  }

  // الاستجابة بتنسيق موحد
  res.status(statusCode).json({
    success: false,
    message,
    // في بيئة التطوير، أرجع Stack Trace للمساعدة في Debug
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
