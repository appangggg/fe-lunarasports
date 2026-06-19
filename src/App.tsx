import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage'; 
import BookingPage from './pages/BookingPage';
import StorePage from './pages/StorePage';
import MarketPage from './pages/MarketPage';
import MabarPage from './pages/MabarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotificationPage from './pages/NotificationPage';
import AdminDashboard from './pages/admin/AdminDashboard'; 
import GoogleSuccess from './pages/GoogleSuccess';
// IMPORT HALAMAN OTP BARU
import OtpPage from './pages/OtpPage';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
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
        {/* ======================================================== */}
        {/* RUTE KHUSUS ADMIN (Punya Sidebar Sendiri, Tanpa Navbar User) */}
        {/* ======================================================== */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        
        {/* RUTE KHUSUS SUPERADMIN */}
        <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />

        {/* RUTE DENGAN NAVBAR & FOOTER (KHUSUS USER/CUSTOMER) */}
        <Route element={<MainLayout />}>
          
          {/* Landing Page SEKARANG DI DALAM MainLayout (Punya Navbar & Footer) */}
          <Route path="/welcome" element={<LandingPage />} /> 

          {/* RUTE PRIVAT (Wajib Login) */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
          <Route path="/market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
          <Route path="/mabar" element={<ProtectedRoute><MabarPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          
        </Route>

      </Routes>
    </Router>
  );
}

export default App;