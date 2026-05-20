// ==========================================
// models/User.js - نموذج المستخدم
// ==========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // الاسم الكامل للمستخدم
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      minlength: [2, 'الاسم يجب أن يكون على الأقل حرفين'],
      maxlength: [50, 'الاسم لا يجب أن يتجاوز 50 حرف'],
    },

    // البريد الإلكتروني
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'يرجى إدخال بريد إلكتروني صحيح',
      ],
    },

    // كلمة المرور (مشفرة)
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'],
      select: false, // لا تُرجع كلمة المرور في الاستعلامات
    },

    // رقم الهاتف
    phone: {
      type: String,
      trim: true,
      match: [/^[+\d\s\-()]{7,20}$/, 'يرجى إدخال رقم هاتف صحيح'],
    },

    // الصورة الشخصية
    avatar: {
      url: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1/skillbridge/avatars/default-avatar.png',
      },
      publicId: {
        type: String,
        default: null,
      },
    },

    // دور المستخدم في النظام
    role: {
      type: String,
      enum: {
        values: ['client', 'provider', 'admin'],
        message: 'الدور يجب أن يكون: client أو provider أو admin',
      },
      default: 'client',
    },

    // حالة الحساب
    isActive: {
      type: Boolean,
      default: true,
    },

    // هل تم توثيق البريد الإلكتروني
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // آخر تسجيل دخول
    lastLogin: {
      type: Date,
      default: null,
    },

    // رمز إعادة تعيين كلمة المرور
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // createdAt و updatedAt تلقائياً
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==========================================
// Virtual Fields (علاقات افتراضية)
// ==========================================

// ربط المستخدم بملف مقدم الخدمة
userSchema.virtual('providerProfile', {
  ref: 'ServiceProvider',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

// ==========================================
// Middleware (Hooks)
// ==========================================

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function (next) {
  // إذا لم تتغير كلمة المرور، تجاهل التشفير
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12); // قوة التشفير
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// Methods (دوال النموذج)
// ==========================================

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// تنسيق بيانات المستخدم للإرجاع (بدون معلومات حساسة)
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    avatar: this.avatar,
    role: this.role,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

// Indexes للبحث السريع
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
