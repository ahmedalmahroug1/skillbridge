// ==========================================
// controllers/userController.js - إدارة حسابات المستخدمين
// ==========================================

const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('express-async-handler');
const { uploadAvatar, deleteImage } = require('../config/cloudinary');

// @desc    تحديث الملف الشخصي (للعميل أو مقدم الخدمة)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  // منع تحديث كلمة المرور أو البريد الإلكتروني من هنا
  const updatedData = { name, phone };

  const user = await User.findByIdAndUpdate(req.user._id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user.toSafeObject(),
  });
});

// @desc    رفع/تحديث الصورة الشخصية
// @route   POST /api/users/avatar
// @access  Private
exports.updateAvatar = [
  uploadAvatar.single('avatar'), // Middleware لرفع الصورة من الـ Form Data
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء اختيار صورة للرفع',
      });
    }

    const user = await User.findById(req.user._id);

    // إذا كانت هناك صورة قديمة على Cloudinary، احذفها (لا تحذف الصورة الافتراضية)
    if (user.avatar && user.avatar.publicId) {
      await deleteImage(user.avatar.publicId);
    }

    // تحديث مسار الصورة في قاعدة البيانات
    user.avatar = {
      url: req.file.path,
      publicId: req.file.filename, // Cloudinary يخزن المعرف في filename
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الصورة الشخصية بنجاح',
      avatar: user.avatar,
    });
  }),
];

// @desc    التسجيل ليصبح مقدم خدمة
// @route   POST /api/users/become-provider
// @access  Private (لعميل فقط)
exports.becomeProvider = asyncHandler(async (req, res) => {
  // التحقق من أن المستخدم ليس مقدم خدمة بالفعل
  if (req.user.role === 'provider') {
    return res.status(400).json({
      success: false,
      message: 'أنت مسجل كمقدم خدمة بالفعل',
    });
  }

  // استخراج البيانات المهنية
  const { specialization, description, experience, hourlyRate, location, skills } = req.body;

  // التحقق من أن الحقول المطلوبة موجودة
  if (!specialization || !description || !experience || !hourlyRate || !location) {
    return res.status(400).json({
      success: false,
      message: 'الرجاء إكمال جميع البيانات المطلوبة',
    });
  }

  // إنشاء ملف مقدم الخدمة
  const provider = await ServiceProvider.create({
    user: req.user._id,
    specialization,
    description,
    experience,
    hourlyRate,
    location, // يجب أن تكون بالشكل { type: 'Point', coordinates: [lng, lat], address, city }
    skills: skills || [],
  });

  // تحديث دور المستخدم في جدول Users
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role: 'provider' },
    { new: true }
  );

  res.status(201).json({
    success: true,
    message: 'تمت ترقية حسابك إلى مقدم خدمة بنجاح! يمكنك الآن إضافة خدماتك.',
    providerProfile: provider,
  });
});

// @desc    الحصول على تفاصيل مقدم خدمة محدد
// @route   GET /api/users/provider/:id
// @access  Public
exports.getProviderProfile = asyncHandler(async (req, res) => {
  // نجلب بيانات مقدم الخدمة مع تقييماته وخدماته ومعلومات حسابه الأساسية
  const provider = await ServiceProvider.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name email phone avatar createdAt',
    })
    .populate('services');

  if (!provider) {
    return res.status(404).json({
      success: false,
      message: 'مقدم الخدمة غير موجود',
    });
  }

  res.status(200).json({
    success: true,
    data: provider,
  });
});
