// ==========================================
// server.js - نقطة الدخول الرئيسية للـ Backend
// ==========================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// تحميل متغيرات البيئة
dotenv.config();

// استيراد الـ Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');

// استيراد معالج الأخطاء
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// استيراد Socket Handler
const socketHandler = require('./socket/socketHandler');

// استيراد اتصال قاعدة البيانات
const connectDB = require('./config/db');

// إنشاء تطبيق Express
const app = express();

// إنشاء HTTP Server لدعم Socket.io
const server = http.createServer(app);

// إعداد Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// تخزين io في app لاستخدامه في الـ controllers
app.set('io', io);

// تهيئة Socket Handler
socketHandler(io);

// ==========================================
// Middleware الأساسي
// ==========================================

// حماية Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Settings
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// تحليل JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging في بيئة التطوير
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting - الحماية من الطلبات الزائدة
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 200, // 200 طلب لكل IP
  message: {
    success: false,
    message: 'لقد تجاوزت الحد الأقصى من الطلبات، يرجى المحاولة بعد 15 دقيقة',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// ==========================================
// API Routes
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Route للتحقق من عمل الـ API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SkillBridge API تعمل بنجاح! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ==========================================
// Error Handling Middleware
// ==========================================
app.use(notFound);
app.use(errorHandler);

// ==========================================
// تشغيل الخادم
// ==========================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();

    server.listen(PORT, () => {
      console.log('==========================================');
      console.log(`🚀 SkillBridge Server يعمل على المنفذ: ${PORT}`);
      console.log(`🌍 بيئة العمل: ${process.env.NODE_ENV}`);
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log('==========================================');
    });
  } catch (error) {
    console.error('❌ فشل تشغيل الخادم:', error.message);
    process.exit(1);
  }
};

startServer();

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});
