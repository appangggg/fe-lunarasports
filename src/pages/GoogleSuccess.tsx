import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Membaca token dan data user dari URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userData = params.get('user');

    if (token && userData) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', decodeURIComponent(userData));
      
      const parsedUser = JSON.parse(decodeURIComponent(userData));
      
      // Bersihkan dan arahkan ke Beranda atau Admin Dashboard
      setTimeout(() => {
        if (parsedUser.is_admin == 1 || parsedUser.is_admin === true) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-[#2FA084] animate-spin mb-4" />
      <h2 className="text-xl font-bold text-[#111111]">Menghubungkan Akun Google...</h2>
    </div>
  );
}