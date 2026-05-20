import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
// import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  // const { login, loading, error } = useAuth();
  const loading = false;
  const error = null;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    /*
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/dashboard');
    }
    */
    navigate('/');
  };

  return (
    <div className="auth-page flex-center" style={{ minHeight: '80vh', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>مرحباً بعودتك</h1>
          <p className="text-muted">سجل دخولك للوصول إلى حسابك</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="example@email.com"
                style={{ paddingRight: '2.5rem' }}
                required
                dir="ltr"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>كلمة المرور</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>نسيت كلمة المرور؟</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="••••••••"
                style={{ paddingRight: '2.5rem' }}
                required
                dir="ltr"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          ليس لديك حساب؟ <Link to="/register" style={{ fontWeight: '600' }}>سجل الآن <FiArrowRight style={{ verticalAlign: 'middle' }} /></Link>
        </div>
      </div>
      
      {/* Background Shapes */}
      <div className="shape shape-1" style={{ width: '300px', height: '300px', top: '10%', right: '20%' }}></div>
      <div className="shape shape-2" style={{ width: '250px', height: '250px', bottom: '10%', left: '20%' }}></div>
    </div>
  );
};

export default Login;
