// ==========================================
// controllers/searchController.js - محرك البحث
// ==========================================

const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('express-async-handler');

// @desc    البحث المتقدم عن مقدمي الخدمات
// @route   GET /api/search/providers
// @access  Public
exports.searchProviders = asyncHandler(async (req, res) => {
  const { q, specialization, city, rating, minRate, maxRate, lat, lng, distance } = req.query;

  let query = {};

  // 1. الفلترة الأساسية
  if (specialization) query.specialization = specialization;
  if (city) query['location.city'] = new RegExp(city, 'i'); // بحث غير حساس لحالة الأحرف
  if (rating) query.avgRating = { $gte: Number(rating) };
  if (minRate || maxRate) {
    query.hourlyRate = {};
    if (minRate) query.hourlyRate.$gte = Number(minRate);
    if (maxRate) query.hourlyRate.$lte = Number(maxRate);
  }

  // 2. البحث النصي السريع في الاسم (يتطلب ربط مع User)
  // لتنفيذ هذا بكفاءة، نستخدم الـ Aggregation Pipeline أو نعتمد على استعلامين
  
  // 3. البحث الجغرافي (قرب الموقع)
  if (lat && lng && distance) {
    // MongoDB يستخدم الراديان للمسافات الدائرية (نقسم على نصف قطر الأرض)
    const radius = distance / 6378.1; // المسافة بالكيلومتر
    
    query.location = {
      $geoWithin: {
        $centerSphere: [[Number(lng), Number(lat)], radius]
      }
    };
  }

  // تنفيذ الاستعلام
  const providers = await ServiceProvider.find(query)
    .populate({
      path: 'user',
      select: 'name avatar',
      // تطبيق فلتر البحث بالاسم إذا وجد (q)
      match: q ? { name: new RegExp(q, 'i') } : {}
    })
    .sort('-avgRating'); // ترتيب حسب التقييم افتراضياً

  // تصفية النتائج لاستبعاد أولئك الذين لم يتطابق اسمهم مع البحث (بسبب استخدام match في populate)
  const filteredProviders = q ? providers.filter(p => p.user !== null) : providers;

  res.status(200).json({
    success: true,
    count: filteredProviders.length,
    data: filteredProviders,
  });
});
