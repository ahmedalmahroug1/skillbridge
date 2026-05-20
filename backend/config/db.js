// ==========================================
// config/db.js - إعداد الاتصال بـ MongoDB
// ==========================================

const mongoose = require('mongoose');

/**
 * الاتصال بقاعدة بيانات MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // هذه الخيارات تحسن الأداء والاستقرار
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB متصل: ${conn.connection.host}`);

    // أحداث الاتصال
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB انقطع الاتصال');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB أعاد الاتصال');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ خطأ في MongoDB:', err.message);
    });

    return conn;
  } catch (error) {
    console.error('❌ فشل الاتصال بـ MongoDB:', error.message);
    throw error;
  }
};

module.exports = connectDB;
