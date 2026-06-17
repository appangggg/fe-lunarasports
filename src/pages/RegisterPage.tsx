import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';
import logoLunara from '../assets/logo-lunara.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // State baru untuk Feedback Visual
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Logika API Laravel Register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData), // Kirim nama, email, dan password
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // JANGAN SIMPAN TOKEN DULU KARENA BELUM VERIFIKASI OTP
        // Langsung arahkan ke halaman OTP sambil membawa data email
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        // Jika gagal (contoh: email sudah dipakai, atau validasi password kurang dari 6 karakter)
        let errorMessage = data.message || 'Registrasi gagal.';
        if (data.errors) {
          // Ambil pesan error pertama dari Laravel (jika ada form validation error)
          const firstError = Object.values(data.errors)[0] as string[];
          errorMessage = firstError[0]; 
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Pastikan server Laravel menyala.');
    } finally {
      setIsLoading(false);
    }
  };

const handleGoogleLogin = () => {
    // Mengarahkan browser langsung ke rute Google Laravel
    window.location.href = 'http://localhost:8000/api/auth/google';
  };
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col md:flex-row font-sans">
      
      {/* BAGIAN KIRI: Visual & Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#111111] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2FA084]/20 to-[#111111] z-10"></div>
        
        <div className="relative z-20 max-w-md px-8">
          <Link to="/welcome" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
            <img src={logoLunara} alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" />
            <span className="text-2xl font-black tracking-tighter text-white">LUNARA<span className="text-[#2FA084]">SPORTS</span></span>
          </Link>
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">Mulai Perjalanan <br/><span className="text-[#2FA084]">Olahragamu</span> Di Sini.</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-white/80"><CheckCircle2 className="w-5 h-5 text-[#2FA084]" /> Booking lapangan tanpa antre</li>
            <li className="flex items-center gap-3 text-white/80"><CheckCircle2 className="w-5 h-5 text-[#2FA084]" /> Cari teman mabar dan komunitas</li>
            <li className="flex items-center gap-3 text-white/80"><CheckCircle2 className="w-5 h-5 text-[#2FA084]" /> Dapatkan poin & reward eksklusif</li>
          </ul>
        </div>
      </div>

      {/* BAGIAN KANAN: Form Register */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <Link to="/welcome" className="md:hidden absolute top-8 left-8 flex items-center gap-2">
          <img src={logoLunara} alt="Logo" className="h-8 w-auto object-contain" />
        </Link>

        <div className="w-full max-w-md mt-12 md:mt-0 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-[#111111] mb-2">Daftar Akun Baru</h1>
          <p className="text-[#888888] mb-8 text-sm">Bergabunglah dengan ribuan atlet amatir lainnya.</p>

          {/* TOMBOL GOOGLE GMAIL */}
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#EEEEEE] text-[#444444] font-bold py-3.5 rounded-xl hover:bg-[#F8F8F8] hover:border-[#CCCCCC] transition-all mb-6 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558l3.793 2.987z"/>
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
            </svg>
            Daftar dengan Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[#EEEEEE] flex-1"></div>
            <span className="text-[#888888] text-xs font-semibold uppercase tracking-wider">Atau dengan Email</span>
            <div className="h-px bg-[#EEEEEE] flex-1"></div>
          </div>

          {/* Kotak Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center justify-center animate-fade-in text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
              <input 
                type="text" 
                placeholder="Nama Lengkap" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 focus:bg-white text-sm font-medium transition-all"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
              <input 
                type="email" 
                placeholder="Alamat Email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 focus:bg-white text-sm font-medium transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
              <input 
                type="password" 
                placeholder="Password (Min. 6 Karakter)" 
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 focus:bg-white text-sm font-medium transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#111111] hover:bg-[#2FA084] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Buat Akun</>}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-[#888888] font-medium">
            Sudah punya akun? <Link to="/login" className="text-[#2FA084] font-bold hover:text-[#1F6F5F] hover:underline transition-colors">Masuk di sini</Link>
          </p>

          {/* BANNER KHUSUS MITRA / PEMILIK LAPANGAN */}
          <div className="mt-10 p-5 bg-[#F0FDF8] border border-[#2FA084]/20 rounded-2xl group transition-all hover:shadow-md">
            <h4 className="text-[#111111] font-bold text-sm mb-1 group-hover:text-[#2FA084] transition-colors">Anda Pemilik Lapangan?</h4>
            <p className="text-[#444444] text-xs mb-4 leading-relaxed">
              Daftarkan arena Anda dan jangkau ribuan atlet amatir. Pendaftaran mitra dilakukan manual via admin.
            </p>
            <a 
              href="https://wa.me/6282196683781?text=Halo%20Admin%20Lunara%20Sports,%20saya%20ingin%20mendaftarkan%20lapangan%20saya." 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}