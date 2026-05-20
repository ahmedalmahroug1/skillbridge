// ==========================================
// controllers/serviceController.js - إدارة الخدمات
// ==========================================

const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');
const APIFeatures = require('../utils/apiFeatures');
const asyncHandler = require('express-async-handler');
const { uploadService } = require('../config/cloudinary');

// @desc    إنشاء خدمة جديدة
// @route   POST /api/services
// @access  Private (Providers Only)
exports.createService = [
  uploadService.array('images', 5), // السماح برفع حتى 5 صور للخدمة
  asyncHandler(async (req, res) => {
    // 1. العثور على ملف مقدم الخدمة للمستخدم الحالي
    const providerProfile = await ServiceProvider.findOne({ user: req.user._id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'يجب أن يكون لديك ملف مقدم خدمة لإنشاء خدمات',
      });
    }

    // 2. تجهيز البيانات
    const { title, description, category, price, priceType, duration, tags } = req.body;
    
    // تحويل الـ tags من نص إلى مصفوفة (إذا أُرسلت كنص مفصول بفواصل)
    let parsedTags = tags;
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(tag => tag.trim());
    }

    // 3. تجهيز الصور إذا تم رفعها
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: file.path,
          publicId: file.filename,
        });
      });
    }

    // 4. إنشاء الخدمة
    const service = await Service.create({
      provider: providerProfile._id,
      title,
      description,
      category,
      price,
      priceType: priceType || 'hourly',
      duration,
      tags: parsedTags,
      images,
    });

    res.status(201).json({
      success: true,
      message: 'تمت إضافة الخدمة بنجاح',
      data: service,
    });
  }),
];

// @desc    الحصول على كل الخدمات (مع فلترة وبحث)
// @route   GET /api/services
// @access  Public
exports.getServices = asyncHandler(async (req, res) => {
  // استخدام APIFeatures للبحث والفلترة
  const features = new APIFeatures(
    Service.find({ isActive: true }).populate({
      path: 'provider',
      select: 'specialization avgRating location isVerified',
      populate: { path: 'user', select: 'name avatar' },
    }),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const services = await features.query;

  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
});

// @desc    الحصول على خدمة واحدة
// @route   GET /api/services/:id
// @access  Public
exports.getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate({
      path: 'provider',
      populate: { path: 'user', select: 'name avatar phone' },
    });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'الخدمة غير موجودة',
    });
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

// @desc    تحديث خدمة
// @route   PUT /api/services/:id
// @access  Private (Service Owner Only)
exports.updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id).populate('provider');

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'الخدمة غير موجودة',
    });
  }

  // التأكد من أن المستخدم هو صاحب الخدمة
  if (service.provider.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح لك بتعديل هذه الخدمة',
    });
  }

  // تحديث الخدمة
  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'تم تحديث الخدمة بنجاح',
    data: service,
  });
});

// @desc    حذف خدمة
// @route   DELETE /api/services/:id
// @access  Private (Service Owner Only)
exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('provider');

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'الخدمة غير موجودة',
    });
  }

  // التأكد من أن المستخدم هو صاحب الخدمة
  if (service.provider.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح لك بحذف هذه الخدمة',
    });
  }

  // في التطبيقات الحقيقية، نفضل "التعطيل" وليس الحذف النهائي للحفاظ على سجلات الحجوزات
  service.isActive = false;
  await service.save();

  res.status(200).json({
    success: true,
    message: 'تم إيقاف الخدمة بنجاح',
  });
});
