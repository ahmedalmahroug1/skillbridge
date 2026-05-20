// ==========================================
// controllers/bookingController.js - إدارة الحجوزات
// ==========================================

const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const asyncHandler = require('express-async-handler');

// @desc    إنشاء حجز جديد
// @route   POST /api/bookings
// @access  Private (Client Only)
exports.createBooking = asyncHandler(async (req, res) => {
  const { providerId, serviceId, scheduledDate, scheduledTime, location, description } = req.body;

  // التحقق من أن مقدم الخدمة موجود
  const provider = await ServiceProvider.findById(providerId);
  if (!provider) {
    return res.status(404).json({ success: false, message: 'مقدم الخدمة غير موجود' });
  }

  // إنشاء الحجز
  const booking = await Booking.create({
    client: req.user._id,
    provider: providerId,
    service: serviceId || undefined,
    scheduledDate,
    scheduledTime,
    location,
    description,
    status: 'pending',
  });

  // إنشاء محادثة جديدة بين العميل ومقدم الخدمة (أو إرجاعها إن وجدت)
  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, provider.user] },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, provider.user],
      booking: booking._id,
    });
  }

  // ربط المحادثة بالحجز
  booking.chat = chat._id;
  await booking.save();

  // إرسال إشعار لمقدم الخدمة
  const io = req.app.get('io');
  await Notification.createAndSend(io, {
    recipient: provider.user,
    type: 'booking_new',
    title: 'طلب خدمة جديد',
    message: `لديك طلب خدمة جديد من ${req.user.name}`,
    data: { bookingId: booking._id },
  });

  res.status(201).json({
    success: true,
    message: 'تم إرسال طلب الحجز بنجاح',
    data: booking,
  });
});

// @desc    الحصول على حجوزات المستخدم (عميل أو مقدم خدمة)
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'provider') {
    // إذا كان المستخدم مقدم خدمة، نجد ملفه الشخصي أولاً
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'ملف مقدم الخدمة غير موجود' });
    }
    filter.provider = provider._id;
  } else {
    // إذا كان عميلاً
    filter.client = req.user._id;
  }

  // إضافة فلترة بالحالة إذا تم تمريرها في الاستعلام
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const bookings = await Booking.find(filter)
    .populate({
      path: 'client',
      select: 'name email phone avatar',
    })
    .populate({
      path: 'provider',
      populate: { path: 'user', select: 'name avatar phone' },
    })
    .populate('service')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    تحديث حالة الحجز (قبول، رفض، إلغاء، إكمال)
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, reason, price } = req.body;
  const bookingId = req.params.id;

  const booking = await Booking.findById(bookingId).populate('provider');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'الحجز غير موجود' });
  }

  const isClient = booking.client.toString() === req.user._id.toString();
  const isProvider = booking.provider.user.toString() === req.user._id.toString();

  // التحقق من الصلاحيات
  if (!isClient && !isProvider && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح لك بتحديث هذا الحجز' });
  }

  let notificationData = {
    recipient: null,
    type: '',
    title: '',
    message: '',
  };

  // معالجة تغييرات الحالة
  if (status === 'accepted' && isProvider) {
    booking.status = 'accepted';
    booking.acceptedAt = Date.now();
    if (price) booking.totalPrice = price; // إذا حدد السعر أثناء القبول
    
    notificationData = {
      recipient: booking.client,
      type: 'booking_accepted',
      title: 'تم قبول طلبك',
      message: 'تم قبول طلب الخدمة الخاص بك، يمكنك الآن التواصل للاتفاق على التفاصيل.',
    };
  } 
  else if (status === 'rejected' && isProvider) {
    booking.status = 'rejected';
    booking.rejectionReason = reason;
    
    notificationData = {
      recipient: booking.client,
      type: 'booking_rejected',
      title: 'تم رفض طلبك',
      message: 'نعتذر، لم يتمكن مقدم الخدمة من قبول طلبك في الوقت الحالي.',
    };
  } 
  else if (status === 'cancelled' && (isClient || isProvider)) {
    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancellationReason = reason;
    
    notificationData = {
      recipient: isClient ? booking.provider.user : booking.client,
      type: 'booking_cancelled',
      title: 'تم إلغاء الحجز',
      message: `تم إلغاء الحجز من قبل ${isClient ? 'العميل' : 'مقدم الخدمة'}.`,
    };
  } 
  else if (status === 'completed' && (isClient || isProvider)) {
    booking.status = 'completed';
    booking.completedAt = Date.now();
    
    // تحديث إحصائيات مقدم الخدمة
    await ServiceProvider.findByIdAndUpdate(booking.provider._id, {
      $inc: { completedBookings: 1 }
    });

    notificationData = {
      recipient: isClient ? booking.provider.user : booking.client,
      type: 'booking_completed',
      title: 'تم إكمال الخدمة',
      message: 'تم تأكيد إكمال الخدمة بنجاح.',
    };
  } else {
    return res.status(400).json({ success: false, message: 'تغيير الحالة غير صالح أو غير مصرح به' });
  }

  await booking.save();

  // إرسال الإشعار
  if (notificationData.recipient) {
    const io = req.app.get('io');
    await Notification.createAndSend(io, {
      ...notificationData,
      data: { bookingId: booking._id },
    });
  }

  res.status(200).json({
    success: true,
    message: 'تم تحديث حالة الحجز بنجاح',
    data: booking,
  });
});
