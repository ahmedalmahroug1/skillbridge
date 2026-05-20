// ==========================================
// middleware/roleMiddleware.js - التحكم في الصلاحيات
// ==========================================

/**
 * authorize - يتحقق من أن المستخدم لديه الدور المطلوب
 * @param {...string} roles - الأدوار المسموح بها
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // التحقق من أن المستخدم مسجل دخول (يجب استخدام protect أولاً)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'يرجى تسجيل الدخول أولاً',
      });
    }

    // التحقق من الدور
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `دورك الحالي (${req.user.role}) لا يملك صلاحية الوصول لهذا المسار`,
      });
    }

    next();
  };
};

/**
 * isAdmin - يتحقق من أن المستخدم مدير
 */
const isAdmin = authorize('admin');

/**
 * isProvider - يتحقق من أن المستخدم مقدم خدمة
 */
const isProvider = authorize('provider', 'admin');

/**
 * isClient - يتحقق من أن المستخدم عميل
 */
const isClient = authorize('client', 'admin');

/**
 * isOwnerOrAdmin - يتحقق من أن المستخدم هو صاحب المورد أو مدير
 */
const isOwnerOrAdmin = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      const ownerId = await getOwnerId(req);

      if (req.user.role === 'admin' || req.user._id.toString() === ownerId.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية الوصول لهذا المورد',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من الصلاحيات',
      });
    }
  };
};

module.exports = { authorize, isAdmin, isProvider, isClient, isOwnerOrAdmin };
