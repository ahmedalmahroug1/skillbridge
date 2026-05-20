import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiBell, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
// import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  // const { user, isAuthenticated, logout } = useAuth();
  const isAuthenticated = false; // Mock until Context is hooked up
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // logout();
    navigate('/');
  };

  return (
    <header className="navbar glass-card">
      <div className="container navbar-container">
        {/* الشعار */}
        <Link to="/" className="navbar-logo">
          <span className="text-gradient">Skill</span>Bridge
        </Link>

        {/* روابط التنقل الرئيسية (للكمبيوتر) */}
        <nav className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
          <Link to="/search" onClick={() => setIsMenuOpen(false)}>البحث عن خدمات</Link>
          <Link to="/how-it-works" onClick={() => setIsMenuOpen(false)}>كيف تعمل</Link>
          
          {/* قسم المستخدم في الموبايل */}
          {isMenuOpen && (
            <div className="mobile-auth-links">
              <hr />
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">لوحة التحكم</Link>
                  <button onClick={handleLogout} className="btn-text text-danger">تسجيل خروج</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline">دخول</Link>
                  <Link to="/register" className="btn btn-primary">حساب جديد</Link>
                </>
              )}
            </div>
          )}
        </nav>

        {/* أيقونات المستخدم (للكمبيوتر) */}
        <div className="navbar-actions">
          <Link to="/search" className="icon-btn">
            <FiSearch size={20} />
          </Link>
          
          {isAuthenticated ? (
            <div className="user-actions">
              <Link to="/notifications" className="icon-btn notification-btn">
                <FiBell size={20} />
                <span className="badge-dot"></span>
              </Link>
              <div className="profile-dropdown-container">
                <button className="profile-btn">
                  <div className="avatar-placeholder flex-center">
                    <FiUser size={18} />
                  </div>
                </button>
                {/* قائمة منسدلة (سيتم إضافتها لاحقاً) */}
              </div>
            </div>
          ) : (
            <div className="auth-buttons desktop-only">
              <Link to="/login" className="login-link">دخول</Link>
              <Link to="/register" className="btn btn-primary">حساب جديد</Link>
            </div>
          )}

          {/* زر القائمة للموبايل */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
