import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar, FiShield } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* قسم الـ Hero */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        
        <div className="container hero-container">
          <div className="hero-content fade-in">
            <span className="badge badge-primary mb-4">أفضل منصة للخدمات المهنية</span>
            <h1 className="hero-title">
              لا تبحث كثيراً.. <br />
              <span className="text-gradient">صنايعية ومهنيين</span> محترفين في خدمتك
            </h1>
            <p className="hero-subtitle">
              اكتشف أمهر الكهربائيين، السباكين، النجارين، والمبرمجين في منطقتك. احجز الخدمة بضغطة زر وتواصل معهم مباشرة بأمان.
            </p>
            
            <div className="hero-search-box glass-card slide-up">
              <form className="search-form">
                <div className="search-input-group">
                  <FiSearch className="search-icon" />
                  <input type="text" placeholder="ما هي الخدمة التي تبحث عنها؟ (مثال: كهربائي)" className="search-input" />
                </div>
                <div className="search-divider"></div>
                <div className="search-input-group">
                  <FiMapPin className="search-icon" />
                  <input type="text" placeholder="المدينة أو المنطقة" className="search-input" />
                </div>
                <button type="submit" className="btn btn-primary search-btn">ابحث الآن</button>
              </form>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <h3>+5,000</h3>
                <p>مقدم خدمة</p>
              </div>
              <div className="stat-item">
                <h3>+12,000</h3>
                <p>عميل سعيد</p>
              </div>
              <div className="stat-item">
                <h3>4.8/5</h3>
                <p>متوسط التقييم</p>
              </div>
            </div>
          </div>
          
          <div className="hero-image-wrapper slide-up">
            {/* سنضع صورة تعبيرية هنا */}
            <div className="hero-image-placeholder">
              <div className="floating-card c1 glass-card">
                <FiStar className="text-warning" />
                <div>
                  <strong>تقييم ممتاز</strong>
                  <p>أحمد محمد (سباك)</p>
                </div>
              </div>
              <div className="floating-card c2 glass-card">
                <FiShield className="text-success" />
                <div>
                  <strong>موثوق</strong>
                  <p>تم التحقق من الهوية</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم التخصصات */}
      <section className="categories-section container">
        <div className="section-header">
          <h2>تصفح حسب <span className="text-gradient">التخصص</span></h2>
          <Link to="/search" className="btn btn-outline">عرض الكل</Link>
        </div>
        
        <div className="categories-grid grid-cols-4">
          {/* نماذج للتخصصات */}
          {[
            { id: 1, name: 'كهرباء', icon: '⚡', color: 'bg-yellow-100', text: 'text-yellow-600' },
            { id: 2, name: 'سباكة', icon: '🔧', color: 'bg-blue-100', text: 'text-blue-600' },
            { id: 3, name: 'برمجة', icon: '💻', color: 'bg-indigo-100', text: 'text-indigo-600' },
            { id: 4, name: 'نجارة', icon: '🪚', color: 'bg-orange-100', text: 'text-orange-600' },
            { id: 5, name: 'ميكانيكا', icon: '🚗', color: 'bg-gray-100', text: 'text-gray-600' },
            { id: 6, name: 'نظافة', icon: '🧹', color: 'bg-green-100', text: 'text-green-600' },
            { id: 7, name: 'دهان', icon: '🖌️', color: 'bg-pink-100', text: 'text-pink-600' },
            { id: 8, name: 'تكييف', icon: '❄️', color: 'bg-cyan-100', text: 'text-cyan-600' },
          ].map(cat => (
            <Link to={`/search?category=${cat.name}`} key={cat.id} className="category-card card">
              <div className="category-icon flex-center">
                <span className="emoji-icon">{cat.icon}</span>
              </div>
              <h3>{cat.name}</h3>
              <p className="text-muted">تصفح الخبراء</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
