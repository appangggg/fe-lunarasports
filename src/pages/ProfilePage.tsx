import { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, CreditCard, History, Edit3, Ticket, MapPin, Crown, Gift, Activity, Flame, Trophy, X, Share2, Lock, Phone, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function ProfilePage() {
  const [showQR, setShowQR] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [weather, setWeather] = useState<{ temp: number, condition: string, icon: string } | null>(null);
  // [TUGAS 3] State untuk proses sync status pembayaran
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handleShareProfile = () => {
    const url = window.location.origin + '/profile/' + user?.id;
    if (navigator.share) {
      navigator.share({
        title: 'Profil Lunara Sports - ' + user?.name,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      setToastMessage('Link Profil disalin ke clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.success) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data)); // Keep localstorage synced
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        // Fallback to localstorage if offline
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse user from local storage', e);
            setUser(null);
          }
        }
      }
    };
    fetchProfile();


    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-5.1476&longitude=119.4327&current_weather=true');
        const data = await res.json();
        if (data && data.current_weather) {
          const temp = data.current_weather.temperature;
          const code = data.current_weather.weathercode;
          let condition = 'Cerah Berawan';
          let icon = '⛅';
          if (code === 0) { condition = 'Cerah'; icon = '☀️'; }
          else if (code >= 1 && code <= 3) { condition = 'Cerah Berawan'; icon = '⛅'; }
          else if (code >= 45 && code <= 48) { condition = 'Berkabut'; icon = '🌫️'; }
          else if (code >= 51 && code <= 67) { condition = 'Hujan Ringan'; icon = '🌧️'; }
          else if (code >= 71 && code <= 77) { condition = 'Salju'; icon = '❄️'; }
          else if (code >= 80 && code <= 82) { condition = 'Hujan Deras'; icon = '🌦️'; }
          else if (code >= 95) { condition = 'Badai Petir'; icon = '⛈️'; }
          setWeather({ temp, condition, icon });
        }
      } catch (err) {
        console.error('Failed to fetch weather', err);
      }
    };
    fetchWeather();
  }, []);

  // [TUGAS 3] Fungsi sync status pembayaran
  const handleSyncPayment = async (bookingId: number) => {
    setSyncingId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/sync-status`, {});
      if (res.success && res.updated) {
        setToastMessage('✅ Pembayaran dikonfirmasi! Status diperbarui.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        // Refresh data profil agar status berubah di UI
        const refreshed = await api.get('/user/profile');
        if (refreshed.success) {
          setUser(refreshed.data);
          localStorage.setItem('user', JSON.stringify(refreshed.data));
        }
      } else if (res.success && res.already_paid) {
        setToastMessage('Pembayaran sudah dikonfirmasi sebelumnya.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setToastMessage('Status: ' + (res.message || 'Pembayaran belum dikonfirmasi.'));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (err: any) {
      setToastMessage('Gagal cek status: ' + (err.message || 'Coba lagi.'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setSyncingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center pt-20">
        <p className="text-[#888888] animate-pulse">Memuat data profil...</p>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-[#F8F8F8] pt-28 pb-20 font-sans">
      {/* Ubah max-w-[800px] menjadi max-w-[1100px] agar lebih lega di desktop */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight mb-8">
          Profil <span className="text-[#2FA084]">Pengguna</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
         {/* ========================================= */}
          {/* KARTU KIRI: Avatar & Gamifikasi */}
          {/* ========================================= */}
          <div className="md:col-span-1 flex flex-col gap-6">
            
            {/* 1. Kartu Profil Dasar (Yang Sudah Ada) */}
            <div className="bg-white rounded-2xl p-6 border border-[#EEEEEE] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#2FA084]/20 to-transparent"></div>
              
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=2FA084&color=fff&size=128&rounded=true&bold=true`} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md relative z-10 mb-4"
              />
              
              <h2 className="text-lg font-bold text-[#111111]">{user.name}</h2>
              <p className="text-sm text-[#888888] mb-4 uppercase">{user.role || 'Member'}</p>

              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mb-6">
                <ShieldCheck className="w-4 h-4" /> Akun Terverifikasi
              </span>

              <Link to="/settings" className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl border border-[#EEEEEE] text-sm font-bold text-[#111111] hover:bg-[#F8F8F8] transition-colors">
                <Edit3 className="w-4 h-4" /> Pengaturan Akun
              </Link>
            </div>

            {/* 2. Kartu Membership & Loyalty (BARU!) */}
            <div className="bg-white rounded-2xl p-5 border border-[#EEEEEE] shadow-sm relative overflow-hidden group">
              {/* Ornamen kilauan gold */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-all"></div>

              <div className="flex justify-between items-start mb-1 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-[#111111] tracking-tight">GOLD</h3>
                  <p className="text-xs font-bold text-[#888888] uppercase tracking-wider">Tier Status</p>
                </div>
                <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 rounded-xl shadow-sm border border-yellow-300/50">
                  <Crown className="w-5 h-5" />
                </div>
              </div>

              <p className="text-[10px] text-[#888888] mb-5 font-medium relative z-10">Member since 2026</p>

              {/* Progress Bar Points */}
              <div className="space-y-2 mb-5 relative z-10">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#2FA084] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2FA084]"></span> {user?.total_points || 0} pts
                  </span>
                  <span className="text-[#888888]">3,000 pts</span>
                </div>
                
                {/* Track Bar */}
                <div className="w-full bg-[#F8F8F8] rounded-full h-2.5 overflow-hidden border border-[#EEEEEE]">
                  {/* Fill Bar (Width menunjukkan progress) */}
                  <div className="bg-gradient-to-r from-[#2FA084] to-[#6FCF97] h-full rounded-full" style={{ width: `${Math.min(((user?.total_points || 0) / 3000) * 100, 100)}%` }}></div>
                </div>
                
                <p className="text-[10px] text-[#888888] text-right">{Math.max(3000 - (user?.total_points || 0), 0)} pts menuju <span className="font-bold text-[#111111]">Platinum</span></p>
              </div>

              <button 
                onClick={() => setShowRewardModal(true)}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl bg-[#111111] text-white text-sm font-bold hover:bg-[#2FA084] transition-colors relative z-10 shadow-md"
              >
                <Gift className="w-4 h-4" />
                Redeem Reward
              </button>
            </div>
            {/* 3. Kartu Bio & Social Share (BARU) */}
            <div className="bg-white rounded-2xl p-5 border border-[#EEEEEE] shadow-sm">
              <h3 className="text-xs font-extrabold text-[#888888] mb-3 tracking-wider uppercase">Tentang Saya</h3>
              <p className="text-sm text-[#111111] italic mb-4">
                "Penggemar Olahraga sejati. Let's play!"
              </p>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-[#F8F8F8] text-[#888888] rounded-md text-[10px] font-bold border border-[#EEEEEE]">#LunaraSports</span>
              </div>
              <button 
                onClick={handleShareProfile}
                className="w-full mt-4 flex justify-center items-center gap-2 py-2 px-4 rounded-xl border border-[#EEEEEE] text-xs font-bold text-[#111111] hover:bg-[#2FA084] hover:text-white hover:border-[#2FA084] transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" /> Bagikan Profil
              </button>
            </div>

            {/* 4. Kartu Pencapaian & Favorit (BARU) */}
            <div className="bg-white rounded-2xl p-5 border border-[#EEEEEE] shadow-sm">
              <h3 className="text-xs font-extrabold text-[#888888] mb-4 tracking-wider uppercase">Favorit & Lencana</h3>
              
              {/* Tag Olahraga Favorit */}
              <div className="flex flex-wrap gap-2 mb-5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                  ⚽ Futsal
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                  🏸 Badminton
                </div>
              </div>

              <div className="w-full h-px bg-[#EEEEEE] mb-5"></div>

              {/* Sistem Badge/Achievement */}
              <div className="grid grid-cols-3 gap-2">
                
                {/* Badge 1 */}
                <div className="flex flex-col items-center text-center group cursor-help">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-white shadow-md mb-1.5 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-bold text-[#111111] leading-tight">Raja<br/>Futsal</span>
                </div>

                {/* Badge 2 */}
                <div className="flex flex-col items-center text-center group cursor-help">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-indigo-500 flex items-center justify-center text-white shadow-md mb-1.5 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-bold text-[#111111] leading-tight">Early<br/>Bird</span>
                </div>

                {/* Badge 3 (Terkunci) */}
                <div className="flex flex-col items-center text-center group cursor-not-allowed">
                  <div className="w-12 h-12 rounded-full bg-[#F8F8F8] border-2 border-dashed border-[#CCCCCC] flex items-center justify-center text-[#CCCCCC] mb-1.5 group-hover:bg-[#EEEEEE] transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-[#888888] leading-tight">Misi<br/>Terkunci</span>
                </div>

              </div>
            </div>
          </div>
          

          {/* KARTU KANAN: Detail Informasi */}
          <div className="md:col-span-2 space-y-6">
            {/* ========================================= */}
            {/* TIKET AKTIF (UPCOMING ACTIVITY) */}
            {/* ========================================= */}
            <div className="bg-gradient-to-br from-[#2FA084] to-[#111111] rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
              {/* Ornamen Cahaya Background */}
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#6FCF97]/20 rounded-full blur-3xl"></div>
              
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                    <Ticket className="w-5 h-5 text-[#6FCF97]" />
                  </div>
                  <h3 className="font-bold tracking-wide text-sm uppercase text-[#CCCCCC]">Jadwal Terdekat</h3>
                </div>
                {user?.active_tickets?.length > 0 && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full animate-pulse ${
                    user.active_tickets[0].status === 'pending' ? 'bg-orange-400 text-white' : 'bg-[#6FCF97] text-[#111111]'
                  }`}>
                    {user.active_tickets[0].status === 'pending' ? 'Menunggu Pembayaran' : 'Aktif'}
                  </span>
                )}
              </div>

              {user?.active_tickets?.length > 0 ? (
                <>
                  <div className="space-y-4 relative z-10 mb-6">
                    <div>
                      <h4 className="font-extrabold text-xl sm:text-2xl mb-1">{user.active_tickets[0].court?.venue?.name || 'Gelora Futsal Arena'} - Lap. {user.active_tickets[0].court?.name || 'A'}</h4>
                      <p className="text-[#CCCCCC] text-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {user.active_tickets[0].court?.venue?.lokasi || 'Jl. Sultan Hasanuddin, Gowa'}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-8 gap-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">Tanggal</p>
                        <p className="font-semibold text-sm">{user.active_tickets[0].booking_date}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">Waktu</p>
                        <p className="font-semibold text-sm">
                          {(typeof user.active_tickets[0].time_slots === 'string' ? JSON.parse(user.active_tickets[0].time_slots) : user.active_tickets[0].time_slots).join(', ')} WITA
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">Kode Booking</p>
                        <p className="font-mono font-bold text-[#6FCF97] text-sm">LNR-{user.active_tickets[0].id}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowQR(true)} 
                    className="w-full bg-white text-[#111111] font-bold py-3 rounded-xl hover:bg-[#F8F8F8] transition-all hover:shadow-[0_0_20px_rgba(47,160,132,0.4)] relative z-10"
                  >
                    Lihat QR Tiket
                  </button>

                  {/* [TUGAS 3] Tombol Cek Status jika masih pending */}
                  {user.active_tickets[0].status === 'pending' && (
                    <button
                      onClick={() => handleSyncPayment(user.active_tickets[0].id)}
                      disabled={syncingId === user.active_tickets[0].id}
                      className="w-full mt-3 flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all relative z-10 disabled:opacity-60"
                    >
                      {syncingId === user.active_tickets[0].id ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Memeriksa ke Midtrans...
                        </>
                      ) : (
                        <> 🔄 Cek Status Pembayaran </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="relative z-10 text-center py-6">
                  <p className="text-[#CCCCCC] text-sm mb-4">Belum ada jadwal olahraga terdekat.</p>
                  <Link to="/booking" className="inline-block bg-[#6FCF97] text-[#111111] font-bold py-2 px-6 rounded-xl hover:bg-[#2FA084] hover:text-white transition-all">
                    Yuk Booking Lapangan!
                  </Link>
                </div>
              )}
            </div>
            {/* ========================================= */}
            {/* STATISTIK OLAHRAGA (SPORTS ANALYTICS) */}
            {/* ========================================= */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              
              {/* Stat 1: Total Match */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EEEEEE] shadow-sm flex flex-col items-center justify-center text-center group hover:border-[#2FA084] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#F8F8F8] text-[#111111] flex items-center justify-center mb-3 group-hover:bg-[#2FA084] group-hover:text-white transition-colors">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-[#111111]">{user?.total_matches || 0}</h4>
                <p className="text-[10px] sm:text-xs font-bold text-[#888888] uppercase tracking-wider mt-0.5">Matches</p>
              </div>

              {/* Stat 2: Total Hours */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EEEEEE] shadow-sm flex flex-col items-center justify-center text-center group hover:border-[#2FA084] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#F8F8F8] text-[#111111] flex items-center justify-center mb-3 group-hover:bg-[#2FA084] group-hover:text-white transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-[#111111]">{user?.total_hours_played || 0}<span className="text-sm font-bold text-[#888888] ml-0.5">h</span></h4>
                <p className="text-[10px] sm:text-xs font-bold text-[#888888] uppercase tracking-wider mt-0.5">Played</p>
              </div>

              {/* Stat 3: Calories */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EEEEEE] shadow-sm flex flex-col items-center justify-center text-center group hover:border-[#2FA084] transition-colors">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-[#111111]">{user?.total_calories ? (user.total_calories / 1000).toFixed(1) : '0'} <span className="text-sm font-bold text-[#888888] ml-0.5">k</span></h4>
                <p className="text-[10px] sm:text-xs font-bold text-[#888888] uppercase tracking-wider mt-0.5">Kcal Burned</p>
              </div>

            </div>
            {/* Info Pribadi */}
            <div className="bg-white rounded-2xl p-6 border border-[#EEEEEE] shadow-sm">
              <h3 className="text-sm font-extrabold text-[#888888] mb-5 tracking-wider">INFORMASI PRIBADI</h3>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#F8F8F8] rounded-xl"><User className="w-5 h-5 text-[#2FA084]" /></div>
                  <div>
                    <p className="text-xs text-[#888888] mb-0.5">Nama Lengkap</p>
                    <p className="font-bold text-[#111111]">{user.name}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-[#EEEEEE]"></div>

                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#F8F8F8] rounded-xl"><Mail className="w-5 h-5 text-[#2FA084]" /></div>
                  <div>
                    <p className="text-xs text-[#888888] mb-0.5">Alamat Email</p>
                    <p className="font-bold text-[#111111]">{user.email}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-[#EEEEEE]"></div>

                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#F8F8F8] rounded-xl"><Phone className="w-5 h-5 text-[#2FA084]" /></div>
                  <div>
                    <p className="text-xs text-[#888888] mb-0.5">Nomor Handphone (WhatsApp)</p>
                    <p className="font-bold text-[#111111]">
                      {user.customer_phone || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Navigasi Cepat */}
            <div className="grid grid-cols-2 gap-4">
              <Link to="/history" className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm hover:shadow-md transition-all group flex flex-col gap-3">
                <div className="w-10 h-10 bg-[#F8F8F8] group-hover:bg-[#2FA084] group-hover:text-white rounded-full flex items-center justify-center text-[#111111] transition-colors">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111111]">Riwayat Pesanan</h4>
                  <p className="text-xs text-[#888888] mt-1">Cek status belanjamu</p>
                </div>
              </Link>

              <button className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm hover:shadow-md transition-all group flex flex-col gap-3 text-left">
                <div className="w-10 h-10 bg-[#F8F8F8] group-hover:bg-[#2FA084] group-hover:text-white rounded-full flex items-center justify-center text-[#111111] transition-colors">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111111]">Metode Pembayaran</h4>
                  <p className="text-xs text-[#888888] mt-1">Pengaturan e-wallet</p>
                </div>
              </button>
            </div>
{/* ========================================= */}
            {/* WIDGET CUACA OLAHRAGA (WEATHER WIDGET) */}
            {/* ========================================= */}
            <div className="bg-gradient-to-r from-blue-500 to-sky-400 rounded-2xl p-6 shadow-sm text-white relative overflow-hidden flex items-center justify-between">
              {/* Ornamen Awan Transparan */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              
              <div className="relative z-10">
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-1">Prakiraan Cuaca - Makassar</p>
                <div className="flex items-end gap-2">
                  <h4 className="text-3xl font-black">{weather ? weather.temp : '--'}°C</h4>
                  <span className="text-sm font-medium mb-1 border-l border-white/30 pl-2">{weather ? weather.condition : 'Memuat...'}</span>
                </div>
                <p className="text-blue-50 text-xs mt-1">Sangat ideal untuk jadwal olahraga malam ini! 🌙</p>
              </div>
              
              <div className="text-6xl drop-shadow-lg relative z-10 animate-pulse" style={{ animationDuration: '3s' }}>
                {weather ? weather.icon : '⛅'}
              </div>
            </div>

            {/* ========================================= */}
            {/* TIMELINE AKTIVITAS (ACTIVITY HISTORY) */}
            {/* ========================================= */}
            <div className="bg-white rounded-2xl p-6 border border-[#EEEEEE] shadow-sm">
              <h3 className="text-sm font-extrabold text-[#888888] mb-6 tracking-wider uppercase">Riwayat Aktivitas</h3>
              
              <div className="relative border-l-2 border-[#EEEEEE] ml-3 space-y-6">
                
                {/* Item Timeline 1 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#2FA084] border-4 border-white shadow-sm"></div>
                  <h4 className="font-bold text-[#111111] text-sm">Futsal Malam bareng Nando dkk</h4>
                  <p className="text-xs text-[#888888] mt-0.5">Gelora Futsal Arena • 2 hari yang lalu</p>
                </div>

                {/* Item Timeline 2 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#CCCCCC] border-4 border-white shadow-sm"></div>
                  <h4 className="font-bold text-[#111111] text-sm">Badminton Ganda Putra</h4>
                  <p className="text-xs text-[#888888] mt-0.5">GOR Samata • 1 minggu yang lalu</p>
                </div>

                {/* Item Timeline 3 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#CCCCCC] border-4 border-white shadow-sm"></div>
                  <h4 className="font-bold text-[#111111] text-sm">Sparing Futsal Teknik Informatika</h4>
                  <p className="text-xs text-[#888888] mt-0.5">Lapangan UINAM • 2 minggu yang lalu</p>
                </div>

              </div>
              
              <Link to="/history" className="w-full mt-6 py-2.5 rounded-xl bg-[#F8F8F8] text-[#111111] text-xs font-bold hover:bg-[#EEEEEE] transition-colors flex items-center justify-center">
                Lihat Semua Aktivitas
              </Link>
            </div>
          </div>
        </div>

      </div>
      {/* ========================================= */}
      {/* MODAL POP-UP QR TIKET */}
      {/* ========================================= */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative transform transition-all animate-fade-in">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#2FA084] to-[#1F6F5F] p-5 text-center relative">
              <button 
                onClick={() => setShowQR(false)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-white font-bold text-lg">Tiket Masuk</h3>
              <p className="text-white/80 text-xs mt-0.5">Tunjukkan layar ini ke petugas venue</p>
            </div>
            
            {/* Body Modal (Isi QR Code) */}
            <div className="p-8 flex flex-col items-center">
              <div className="p-4 bg-white border-2 border-dashed border-[#2FA084]/30 rounded-2xl mb-5 shadow-sm">
                {/* Menggunakan API publik untuk men-generate QR Code asli */}
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LNR-8X92Q-LUNARA-SPORTS" 
                  alt="QR Code Ticket" 
                  className="w-48 h-48" 
                />
              </div>
              <h4 className="font-mono font-bold text-2xl tracking-widest text-[#111111] mb-1">LNR-8X92Q</h4>
              <p className="text-[#888888] text-sm font-medium">Gelora Futsal Arena - Lap. A</p>
              <p className="text-[#2FA084] text-xs font-bold mt-2 bg-[#2FA084]/10 px-3 py-1 rounded-full">Valid & Sudah Dibayar</p>
            </div>
            
          </div>
        </div>
      )}

      {/* MODAL REDEEM REWARD */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative">
            <button 
              onClick={() => setShowRewardModal(false)} 
              className="absolute top-4 right-4 text-[#888888] hover:text-[#111111] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-[#111111] text-xl mb-1">Tukar Poin Reward</h3>
            <p className="text-sm text-[#888888] mb-6">Saldo poin kamu saat ini: <span className="font-bold text-[#2FA084]">{user?.total_points || 0} pts</span></p>
            
            <button 
              onClick={() => {
                setToastMessage('Poin belum cukup untuk ditukar!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                setShowRewardModal(false);
              }}
              className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl hover:bg-[#2FA084] transition-colors"
            >
              Tukar Voucher Diskon
            </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          
      <div className="bg-[#111111] text-white shadow-xl rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2FA084]" />
            <p className="text-sm font-bold tracking-wide">{toastMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
}