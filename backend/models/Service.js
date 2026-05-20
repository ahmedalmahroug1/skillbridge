// ==========================================
// models/Service.js - نموذج الخدمة
// ==========================================

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    // مقدم الخدمة
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },

    // عنوان الخدمة
    title: {
      type: String,
      required: [true, 'عنوان الخدمة مطلوب'],
      trim: true,
      maxlength: [100, 'العنوان لا يجب أن يتجاوز 100 حرف'],
    },

    // وصف الخدمة
    description: {
      type: String,
      required: [true, 'وصف الخدمة مطلوب'],
      maxlength: [500, 'الوصف لا يجب أن يتجاوز 500 حرف'],
    },

    // الفئة
    category: {
      type: String,
      required: [true, 'الفئة مطلوبة'],
      enum: [
        'electrician', 'plumber', 'mechanic', 'programmer',
        'carpenter', 'painter', 'cleaner', 'welder',
        'ac_technician', 'designer', 'tutor', 'other',
      ],
    },

    // السعر الأساسي
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: [0, 'السعر لا يمكن أن يكون سالباً'],
    },

    // نوع التسعير
    priceType: {
      type: String,
      enum: ['fixed', 'hourly', 'negotiable'],
      default: 'hourly',
    },

    // مدة التنفيذ المتوقعة (بالساعات)
    duration: {
      type: Number,
      min: [0.5, 'المدة الدنيا نصف ساعة'],
    },

    // صور الخدمة
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],

    // هل الخدمة نشطة
    isActive: {
      type: Boolean,
      default: true,
    },

    // الكلمات المفتاحية للبحث
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ provider: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Full-text search

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
