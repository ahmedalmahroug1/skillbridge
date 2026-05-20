// ==========================================
// models/ServiceProvider.js - نموذج مقدم الخدمة
// ==========================================

const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema(
  {
    // ربط بالمستخدم
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // التخصص المهني
    specialization: {
      type: String,
      required: [true, 'التخصص مطلوب'],
      enum: {
        values: [
          'electrician',    // كهربائي
          'plumber',        // سباك
          'mechanic',       // ميكانيكي
          'programmer',     // مبرمج
          'carpenter',      // نجار
          'painter',        // دهان
          'cleaner',        // عمال تنظيف
          'welder',         // لحام
          'ac_technician',  // تقني تكييف
          'designer',       // مصمم
          'tutor',          // مدرس خصوصي
          'other',          // أخرى
        ],
        message: 'التخصص غير صالح',
      },
    },

    // وصف الخدمات المقدمة
    description: {
      type: String,
      required: [true, 'وصف الخدمة مطلوب'],
      minlength: [20, 'الوصف يجب أن يكون على الأقل 20 حرف'],
      maxlength: [1000, 'الوصف لا يجب أن يتجاوز 1000 حرف'],
    },

    // سنوات الخبرة
    experience: {
      type: Number,
      required: [true, 'سنوات الخبرة مطلوبة'],
      min: [0, 'سنوات الخبرة لا يمكن أن تكون سالبة'],
      max: [50, 'سنوات الخبرة لا يمكن أن تتجاوز 50'],
    },

    // السعر بالساعة
    hourlyRate: {
      type: Number,
      required: [true, 'السعر بالساعة مطلوب'],
      min: [0, 'السعر لا يمكن أن يكون سالباً'],
    },

    // الموقع الجغرافي (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        type: String,
        required: [true, 'العنوان مطلوب'],
      },
      city: {
        type: String,
        required: [true, 'المدينة مطلوبة'],
      },
      country: {
        type: String,
        default: 'الجزائر',
      },
    },

    // صور البورتفوليو
    portfolio: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        caption: { type: String, default: '' },
      },
    ],

    // المهارات الإضافية
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // الشهادات والمؤهلات
    certifications: [
      {
        title: { type: String },
        issuer: { type: String },
        year: { type: Number },
      },
    ],

    // هل متاح للعمل حالياً
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // متوسط التقييم (يُحسب تلقائياً)
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10, // تقريب لرقم واحد عشري
    },

    // إجمالي عدد التقييمات
    totalReviews: {
      type: Number,
      default: 0,
    },

    // إجمالي الحجوزات المكتملة
    completedBookings: {
      type: Number,
      default: 0,
    },

    // هل تم التحقق من هوية مقدم الخدمة بواسطة الإدارة
    isVerified: {
      type: Boolean,
      default: false,
    },

    // أيام العمل
    workingDays: {
      type: [String],
      enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      default: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    },

    // ساعات العمل
    workingHours: {
      from: { type: String, default: '08:00' },
      to: { type: String, default: '18:00' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==========================================
// Geo Index للبحث الجغرافي
// ==========================================
serviceProviderSchema.index({ location: '2dsphere' });
serviceProviderSchema.index({ specialization: 1 });
serviceProviderSchema.index({ avgRating: -1 });
serviceProviderSchema.index({ isAvailable: 1 });
serviceProviderSchema.index({ 'location.city': 1 });

// Virtual: الخدمات المرتبطة بمقدم الخدمة
serviceProviderSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'provider',
});

// Virtual: التقييمات المرتبطة
serviceProviderSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'provider',
});

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);

module.exports = ServiceProvider;
