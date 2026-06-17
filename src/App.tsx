import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage'; 
import BookingPage from './pages/BookingPage';

// IMPORT HALAMAN OTP BARU
const ProtectedRoute = ({ children }: { children: any }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/welcome" replace />;
  return children;
};
const AdminRoute = ({ children }: { children: any }) => {
  const token = localStorage.getItem('token');
  const userStorage = localStorage.getItem('user');
  const user = userStorage ? JSON.parse(userStorage) : null;
  
  if (!token) return <Navigate to="/welcome" replace />;
  // Perbaiki pengecekan is_admin agar lebih robust (mendukung integer 1 atau boolean true)
  if (user?.is_admin != 1 && user?.is_admin !== true && user?.role !== 'admin' && user?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const SuperAdminRoute = ({ children }: { children: any }) => {
  const token = localStorage.getItem('token');
  const userStorage = localStorage.getItem('user');
  const user = userStorage ? JSON.parse(userStorage) : null;
  
  if (!token) return <Navigate to="/welcome" replace />;
  if (user?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* RUTE POLOS (Hanya untuk form Login, Register, dan OTP) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpPage />} /> {/* RUTE OTP BARU */}
<Route path="/google-success" element={<GoogleSuccess />} />
        
        {/* RUTE KHUSUS SUPERADMIN */}

        {/* RUTE DENGAN NAVBAR & FOOTER (KHUSUS USER/CUSTOMER) */}
        <Route element={<MainLayout />}>
          
          {/* Landing Page SEKARANG DI DALAM MainLayout (Punya Navbar & Footer) */}
          <Route path="/welcome" element={<LandingPage />} /> 

          {/* RUTE PRIVAT (Wajib Login) */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
  
        </Route>

      </Routes>
    </Router>
  );
}

export default App;