import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// المؤقتة
const Search = () => <div className="container flex-center" style={{height: '80vh'}}><h1>البحث عن الخدمات</h1></div>;
const NotFound = () => <div className="container flex-center" style={{height: '80vh'}}><h1 className="text-gradient">404 - الصفحة غير موجودة</h1></div>;

function App() {
  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* <Footer /> */}
    </div>
  );
}

export default App;
