import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ''; // Mengambil email kiriman dari halaman register

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Kalau user nyasar ke sini tanpa mendaftar, kembalikan ke register
  if (!email) {
    navigate('/register');
    return null;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email, otp: otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Berhasil! Simpan token dan redirect ke home atau admin dashboard
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        if (data.data.is_admin == 1 || data.data.is_admin === true) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        console.log("🚨 HASIL DEBUG DARI LARAVEL:", data); // Intip di tab Console!
        setError(data.message || 'Kode OTP salah.');
      }
    } catch (err) {
      setError('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full p-8 sm:p-10 rounded-3xl shadow-xl border border-[#EEEEEE] text-center animate-fade-in">
        
        <div className="w-20 h-20 bg-green-50 text-[#2FA084] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-[#111111] mb-2">Cek Email Kamu</h1>
        <p className="text-[#888888] text-sm mb-8 leading-relaxed">
          Kami telah mengirimkan 4 digit kode OTP ke <br/>
          <strong className="text-[#111111]">{email}</strong>
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <input 
            type="text"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Hanya terima angka
            placeholder="0 0 0 0"
            className="w-full text-center text-4xl font-black tracking-[1em] py-4 bg-[#F8F8F8] border border-[#EEEEEE] rounded-2xl focus:outline-none focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 transition-all mb-6"
            required
          />
          
          <button 
            type="submit"
            disabled={isLoading || otp.length < 4}
            className="w-full bg-[#111111] hover:bg-[#2FA084] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verifikasi & Masuk'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
}