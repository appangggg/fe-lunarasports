import { useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Users, ShoppingBag, ArrowRight, Trophy, Flame, ChevronRight, Bell, Clock, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function HomePage() {
  const [firstName, setFirstName] = useState('Sobat Olahraga');
  const [greetingTime, setGreetingTime] = useState('Selamat Pagi,');
  const [catchyPhrase, setCatchyPhrase] = useState('Siap <span className="text-[#2FA084]">berkeringat?</span>');
  const { user, popularVenues, vouchers, fetchAllHomeData } = useAppStore();

  // Setup Dynamic Greetings
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreetingTime('Selamat Pagi,');
    else if (hour < 15) setGreetingTime('Selamat Siang,');
    else if (hour < 18) setGreetingTime('Selamat Sore,');
    else setGreetingTime('Selamat Malam,');

    const phrases = [
      'Siap <span className="text-[#2FA084]">berkeringat?</span>',
      'Ayo mulai <span className="text-[#2FA084]">aktivitasmu!</span>',
      'Waktunya <span className="text-[#2FA084]">berolahraga!</span>',
      'Tetap sehat dan <span className="text-[#2FA084]">semangat!</span>',
      'Jangan lupa <span className="text-[#2FA084]">pemanasan!</span>'
    ];
    setCatchyPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  // Update firstname if user exists in state
  useEffect(() => {
    if (user && user.name) {
      setFirstName(user.name.split(' ')[0]);
    } else {
      const userStorage = localStorage.getItem('user');
      if (userStorage) {
        try {
          const parsedUser = JSON.parse(userStorage);
          setFirstName(parsedUser.name.split(' ')[0]);
        } catch (e) {}
      }
    }
  }, [user]);

  // Fetch all home data (will use cache if already loaded)
  useEffect(() => {
    const startTime = performance.now();
    console.log("[Data Fetch] Mulai memuat data Beranda lewat Zustand...");
    (window as any).homeFetchStartTime = startTime;
    fetchAllHomeData().then(() => {
      const finishTime = performance.now();
      console.log(`[Data Fetch] SEMUA data Beranda dari API siap dalam ${(finishTime - startTime).toFixed(2)}ms`);
      (window as any).homeFetchFinishTime = finishTime;
    });
  }, [fetchAllHomeData]);

  useLayoutEffect(() => {
    if ((window as any).homeFetchFinishTime && popularVenues.length > 0) {
      const renderTime = performance.now() - (window as any).homeFetchFinishTime;
      console.log(`[Performance] React selesai merender UI Beranda dalam ${renderTime.toFixed(2)}ms setelah data siap.`);
      console.log(`[Performance] TOTAL WAKTU dari awal buka halaman sampai UI tampil: ${(performance.now() - (window as any).homeFetchStartTime).toFixed(2)}ms`);
    }
  }, [popularVenues, user, vouchers]);

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 pb-24 font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================= */}
        {/* HEADER & GREETING */}
        {/* ========================================= */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <p className="text-[#888888] font-medium text-sm mb-1">{greetingTime}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {firstName}! <span dangerouslySetInnerHTML={{ __html: catchyPhrase }}></span>
            </h1>
          </div>
        </div>

        {/* ========================================= */}
        {/* UPCOMING MATCH (Jadwal Terdekat) */}
        {/* ========================================= */}
        {user?.active_tickets && user.active_tickets.length > 0 && (
          <div className="bg-gradient-to-r from-[#2FA084] to-[#1F6F5F] rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden animate-fade-in">
            {/* Ornamen Background */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute right-10 bottom-0 w-24 h-24 bg-[#111111]/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 bg-white/20 w-max px-3 py-1.5 rounded-lg backdrop-blur-md mb-4 border border-white/20">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-xs font-bold uppercase tracking-wider">Jadwal Terdekat</span>
                </div>
                <h2 className="text-2xl font-black mb-1">{user.active_tickets[0].court?.venue?.name || 'Gelora Futsal Arena'} - Lap. {user.active_tickets[0].court?.name || 'A'}</h2>
                <p className="text-white/80 text-sm flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" /> {user.active_tickets[0].court?.venue?.lokasi || 'Jl. Sultan Hasanuddin, Gowa'}
                </p>
                <div className="flex gap-4 text-sm font-bold bg-black/20 w-max px-4 py-2 rounded-xl border border-white/10">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#6FCF97]" /> {user.active_tickets[0].booking_date}</span>
                  <div className="w-px h-5 bg-white/30"></div>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#6FCF97]" /> {(typeof user.active_tickets[0].time_slots === 'string' ? JSON.parse(user.active_tickets[0].time_slots) : user.active_tickets[0].time_slots)[0]} WITA</span>
                </div>
              </div>
              
              <Link to="/profile" className="w-full sm:w-auto bg-white text-[#111111] font-bold px-6 py-3.5 rounded-xl hover:bg-[#F8F8F8] transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-xl transform hover:-translate-y-1">
                Lihat Tiket <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* QUICK MENUS (Navigasi Cepat) */}
        {/* ========================================= */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
          
          <Link to="/booking" className="flex flex-col items-center gap-3 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-sm border border-[#EEEEEE] flex items-center justify-center group-hover:bg-[#2FA084] group-hover:border-[#2FA084] transition-all transform group-hover:-translate-y-1">
              <Calendar className="w-6 h-6 text-[#2FA084] group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#444444] group-hover:text-[#2FA084] transition-colors text-center">Booking Lapangan</span>
          </Link>

          <Link to="/mabar" className="flex flex-col items-center gap-3 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-sm border border-[#EEEEEE] flex items-center justify-center group-hover:bg-[#2FA084] group-hover:border-[#2FA084] transition-all transform group-hover:-translate-y-1">
              <Users className="w-6 h-6 text-[#2FA084] group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#444444] group-hover:text-[#2FA084] transition-colors text-center">Cari Lawan / Mabar</span>
          </Link>

          <Link to="/store" className="flex flex-col items-center gap-3 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-sm border border-[#EEEEEE] flex items-center justify-center group-hover:bg-[#2FA084] group-hover:border-[#2FA084] transition-all transform group-hover:-translate-y-1">
              <ShoppingBag className="w-6 h-6 text-[#2FA084] group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#444444] group-hover:text-[#2FA084] transition-colors text-center">Toko Olahraga</span>
          </Link>

        <Link to="/history" className="flex flex-col items-center gap-3 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-sm border border-[#EEEEEE] flex items-center justify-center group-hover:bg-[#2FA084] group-hover:border-[#2FA084] transition-all transform group-hover:-translate-y-1">
              <Clock className="w-6 h-6 text-[#2FA084] group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#444444] group-hover:text-[#2FA084] transition-colors text-center">Riwayat Transaksi</span>
          </Link>

        </div>

        {/* ========================================= */}
        {/* PROMO BANNER */}
        {/* ========================================= */}
        {vouchers.length > 0 ? (
          <div className="bg-[#111111] rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-lg mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="max-w-xs">
              <span className="bg-[#D4AF37] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-3 inline-block">Flash Sale</span>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">Diskon {vouchers[0].discount_type === 'percent' ? vouchers[0].discount_value + '%' : 'Rp ' + vouchers[0].discount_value.toLocaleString('id-ID')} Booking Futsal!</h3>
              <p className="text-[#888888] text-xs">Gunakan kode: <span className="text-[#2FA084] font-bold">{vouchers[0].code}</span></p>
            </div>
            <img src="https://ui-avatars.com/api/?name=%25&background=2FA084&color=fff&size=80&rounded=true" alt="Promo" className="w-16 h-16 sm:w-20 sm:h-20 animate-pulse" />
          </div>
        ) : (
          <div className="bg-[#111111] rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-lg mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="max-w-xs">
              <span className="bg-[#D4AF37] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-3 inline-block">Promo Spesial</span>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">Tunggu promo menarik dari Lunara Sports!</h3>
              <p className="text-[#888888] text-xs">Akan segera hadir.</p>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* REKOMENDASI LAPANGAN (Popular Venues) */}
        {/* ========================================= */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-[#111111]">Rekomendasi Lapangan</h2>
            <Link to="/booking" className="text-sm font-bold text-[#2FA084] hover:text-[#1F6F5F] flex items-center gap-1 transition-colors">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {popularVenues.map((item) => (
              <Link to="/booking" key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(47,160,132,0.15)] transition-all duration-300 group flex flex-col border border-[#EEEEEE]">
                {/* Header Gambar */}
                <div className="relative h-[220px] overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#111111] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm max-w-[200px] truncate">
                    {item.sportsLabel || item.category}
                  </div>
                </div>

                {/* Konten Data */}
                <div className="p-6 flex flex-col flex-grow relative bg-white">
                  <h3 className="text-xl font-extrabold text-[#111111] mb-2 leading-tight group-hover:text-[#2FA084] transition-colors">{item.name}</h3>
                  
                  <div className="flex items-center justify-between text-[#888888] text-sm mb-5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate font-medium">{item.lokasi}</span>
                    </div>
                  </div>
                  
                  {/* Fasilitas */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.fasilitasUtama.slice(0, 3).map((fasilitas: string, index: number) => (
                      <span key={index} className="inline-flex items-center gap-1.5 bg-[#F0FDF8] text-[#1F6F5F] text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-[#2FA084]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {fasilitas}
                      </span>
                    ))}
                    {item.fasilitasUtama.length > 3 && (
                      <span className="inline-flex items-center bg-[#F8F8F8] text-[#888888] text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-[#EEEEEE]">
                        +{item.fasilitasUtama.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* Footer Card: Harga & Rating */}
                  <div className="mt-auto border-t border-[#EEEEEE] pt-5 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block mb-0.5">Mulai dari</span>
                      <span className="text-[#2FA084] font-black text-xl">
                        Rp {Number(item.hargaAngka).toLocaleString('id-ID')}
                        <span className="text-xs font-semibold text-[#888888]">/jam</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-[#FFF9E6] px-2.5 py-1.5 rounded-lg border border-[#F2C94C]/30">
                      <Star className="w-4 h-4 text-[#F2C94C] fill-[#F2C94C]" />
                      <span className="font-bold text-[#111111] text-sm">{item.rating_display}</span>
                    </div>
                    <button type="button" className="bg-[#111111] text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-[#2FA084] transition-colors shadow-sm">
                      Pilih Jadwal
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}