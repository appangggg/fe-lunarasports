import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage'; 
import BookingPage from './pages/BookingPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/welcome" replace />;
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
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* RUTE DENGAN NAVBAR & FOOTER (KHUSUS USER/CUSTOMER) */}
        <Route element={<MainLayout />}>
          
          {/* Landing Page SEKARANG DI DALAM MainLayout (Punya Navbar & Footer) */}
          <Route path="/welcome" element={<LandingPage />} /> 

          {/* RUTE PRIVAT (Wajib Login) */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
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