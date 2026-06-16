import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import logoLunara from '../assets/logo-lunara.png';
import { api } from '../services/api'; // <--- IMPORT API BARU KITA

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); 

    try {
      // 1. KODE JAUH LEBIH BERSIH DAN PENDEK
      const data = await api.post('/login', { email, password });

      if (data.success) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Cek apakah user adalah admin atau superadmin
        if (data.data.role === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else if (data.data.is_admin == 1 || data.data.is_admin === true || data.data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Login gagal, periksa kembali email dan password Anda.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Pastikan backend Laravel menyala.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // 2. MENGGUNAKAN .ENV AGAR URL DINAMIS
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      
      {/* BAGIAN KIRI: Ilustrasi Gambar */}
      <div className="hidden lg:flex w-1/2 relative bg-[#111111] items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2000&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#2FA084]/80 to-[#111111]/90"></div>

        <div className="relative z-10 p-12 max-w-lg text-white">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src={logoLunara} 
              alt="Logo Lunara Sports" 
              className="h-10 w-auto object-contain" 
            />
            <span className="text-3xl font-black tracking-tighter text-white">
              LUNARA<span className="text-[#2FA084]">SPORTS</span>
            </span>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">
            Kembali ke Arena. <br/> Lanjutkan Permainanmu.
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Masuk untuk melihat jadwal booking-mu, cek riwayat pertandingan, dan temukan lawan sparring baru.
          </p>
        </div>
      </div>

      {/* BAGIAN KANAN: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link to="/" className="absolute top-6 left-6 lg:left-8 text-sm font-bold text-[#888888] flex items-center gap-2 hover:text-[#2FA084] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Beranda
        </Link>

        <div className="w-full max-w-md animate-fade-in mt-10 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-[#111111] mb-2">Selamat Datang Kembali!</h2>
            <p className="text-[#888888]">Silakan masukkan email dan password Anda untuk masuk.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center justify-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Tag form kosong yang double sudah dihapus */}
          <form className="space-y-5" onSubmit={handleLogin}>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-bold text-[#2FA084] hover:underline">Lupa Sandi?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#111111] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 flex justify-center items-center gap-2 py-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#111111] hover:bg-[#2FA084] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2FA084] transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk Sekarang'}
            </button>
            
            {/* Garis Pemisah */}
            <div className="mt-6 flex items-center justify-between">
                <span className="border-b w-1/5 lg:w-1/4 border-gray-300"></span>
                <span className="text-xs text-center text-gray-500 uppercase">atau</span>
                <span className="border-b w-1/5 lg:w-1/4 border-gray-300"></span>
            </div>

            {/* Tombol Google */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-[#111111] font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <img 
                    src="https://www.svgrepo.com/show/475656/google-color.svg" 
                    alt="Google Logo" 
                    className="w-5 h-5" 
                />
                Masuk dengan Google
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-[#888888] font-medium">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-[#2FA084] hover:text-[#1F6F5F] hover:underline transition-colors">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}