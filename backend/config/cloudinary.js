// ==========================================
// config/cloudinary.js - إعداد Cloudinary لرفع الصور
// ==========================================

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// إعداد Cloudinary بالمفاتيح من .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// إعداد التخزين لصور الملف الشخصي
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillbridge/avatars',       // مجلد الصور في Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // اقتصاص تلقائي على الوجه
    ],
  },
});

// إعداد التخزين لصور البورتفوليو
const portfolioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillbridge/portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto' },
    ],
  },
});

// إعداد التخزين لصور الخدمات
const serviceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillbridge/services',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 600, height: 400, crop: 'fill', quality: 'auto' },
    ],
  },
});

// دالة لحذف صورة من Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ تم حذف الصورة: ${publicId}`);
  } catch (error) {
    console.error('❌ خطأ في حذف الصورة:', error.message);
  }
};

// Multer Upload instances
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط برفع الصور'), false);
    }
  },
});

const uploadPortfolio = multer({
  storage: portfolioStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط برفع الصور'), false);
    }
  },
});

const uploadService = multer({
  storage: serviceStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط برفع الصور'), false);
    }
  },
});

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadPortfolio,
  uploadService,
  deleteImage,
};
