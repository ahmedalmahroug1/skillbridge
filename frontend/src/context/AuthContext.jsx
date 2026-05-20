import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // إعداد Axios الافتراضي
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // جلب بيانات المستخدم عند تحميل التطبيق
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error('Error fetching user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // دالة تسجيل الدخول
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/auth/login', { email, password });
      
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // دالة تسجيل مستخدم جديد
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/auth/register', userData);
      
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // دالة تسجيل الخروج
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.log('Error logging out from server');
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
