import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi';
// import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client' // الافتراضي
  });
  
  // const { register, loading, error } = useAuth();
  const loading = false;
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('كلمات المرور غير متطابقة');
    }

    /*
    const success = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role
    });

    if (success) {
      navigate('/dashboard');
    }
    */
    navigate('/');
  };

  return (
    <div className="auth-page flex-center" style={{ minHeight: '85vh', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '550px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>إنشاء حساب جديد</h1>
          <p className="text-muted">انضم إلى مجتمع SkillBridge للخدمات المهنية</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* اختيار نوع الحساب */}
          <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <label className={`card ${formData.role === 'client' ? 'active-role' : ''}`} style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '1rem', border: formData.role === 'client' ? '2px solid var(--primary)' : '1px solid var(--border-color)', transition: 'all 0.3s' }}>
              <input type="radio" name="role" value="client" checked={formData.role === 'client'} onChange={handleChange} style={{ display: 'none' }} />
              <FiUser size={24} style={{ color: formData.role === 'client' ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '600' }}>أنا عميل</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>أبحث عن خدمات</div>
            </label>
            
            <label className={`card ${formData.role === 'provider' ? 'active-role' : ''}`} style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '1rem', border: formData.role === 'provider' ? '2px solid var(--secondary)' : '1px solid var(--border-color)', transition: 'all 0.3s' }}>
              <input type="radio" name="role" value="provider" checked={formData.role === 'provider'} onChange={handleChange} style={{ display: 'none' }} />
              <FiUser size={24} style={{ color: formData.role === 'provider' ? 'var(--secondary)' : 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '600' }}>مقدم خدمة</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>أقدم خدماتي</div>
            </label>
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">الاسم الكامل</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="أحمد محمد" style={{ paddingRight: '2.5rem' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">رقم الهاتف</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" placeholder="05XX XXX XXX" style={{ paddingRight: '2.5rem' }} dir="ltr" required />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="example@email.com" style={{ paddingRight: '2.5rem' }} required dir="ltr" />
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" placeholder="••••••••" style={{ paddingRight: '2.5rem' }} required dir="ltr" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">تأكيد كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control" placeholder="••••••••" style={{ paddingRight: '2.5rem' }} required dir="ltr" />
              </div>
            </div>
          </div>

          <button type="submit" className={`btn ${formData.role === 'provider' ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'إنشاء حساب'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          لديك حساب بالفعل؟ <Link to="/login" style={{ fontWeight: '600' }}>تسجيل الدخول <FiArrowRight style={{ verticalAlign: 'middle' }} /></Link>
        </div>
      </div>
      
      {/* Background Shapes */}
      <div className="shape shape-1" style={{ width: '400px', height: '400px', top: '-10%', left: '-10%', background: formData.role === 'provider' ? 'var(--secondary-light)' : 'var(--primary-light)' }}></div>
      <div className="shape shape-2" style={{ width: '300px', height: '300px', bottom: '-5%', right: '-5%' }}></div>
    </div>
  );
};

export default Register;
