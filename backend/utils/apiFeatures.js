// ==========================================
// utils/apiFeatures.js - أدوات للفلترة، البحث، الترتيب والتقسيم (Pagination)
// ==========================================

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. الفلترة المتقدمة
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'lat', 'lng', 'distance'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // تحويل عمليات المقارنة المتقدمة (gte, gt, lte, lt)
    // مثال: ?price[gte]=100 => { price: { $gte: 100 } }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2. البحث النصي
  search() {
    if (this.queryString.search) {
      // بحث باستخدام الـ Text Index إذا كان متوفراً (مثل نموذج Services)
      // أو استخدام Regex للبحث الجزئي في الحقول النصية إذا طلبنا البحث بها
      
      // هنا سنستخدم Text Search الافتراضي لـ MongoDB
      this.query = this.query.find({
        $text: { $search: this.queryString.search },
      });
    }
    return this;
  }

  // 3. الترتيب
  sort() {
    if (this.queryString.sort) {
      // تحويل الفواصل لمسافات (لأن MongoDB يتوقع مسافات بين الحقول)
      // مثال: ?sort=-price,avgRating => '-price avgRating'
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // الترتيب الافتراضي (الأحدث أولاً)
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // 4. تحديد الحقول المرجعة (Field Limiting)
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // إخفاء الحقول غير الضرورية (مثل __v)
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // 5. التقسيم (Pagination)
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
