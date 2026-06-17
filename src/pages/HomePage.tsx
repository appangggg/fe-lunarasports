import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Users, ShoppingBag, ArrowRight, Trophy, Flame, ChevronRight, Bell, Clock } from 'lucide-react';

export default function HomePage() {
  const [firstName, setFirstName] = useState('Sobat Olahraga');
  const [user, setUser] = useState<any>(null);

  // Mengambil nama user dari LocalStorage untuk sapaan personal
  useEffect(() => {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      try {
        const parsedUser = JSON.parse(userStorage);
        setUser(parsedUser);
        setFirstName(parsedUser.name.split(' ')[0]); 
      } catch (e) {
        console.error("Gagal parse user data", e);
      }
    }

    // Ambil data profil terbaru dari API agar active_tickets sinkron
    import('../services/api').then(({ api }) => {
      api.get('/user/profile').then(res => {
        if (res.success) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      }).catch(err => console.error("Gagal memuat profil terbaru", err));
    });

  }, []);

  // Data Dummy Lapangan Populer
  const popularVenues = [
    { id: 1, name: 'Gelora Futsal Arena', category: 'Futsal', location: 'Samata, Gowa', price: '150.000', rating: 4.8, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop' },
    { id: 2, name: 'GOR Cempaka Putih', category: 'Badminton', location: 'Makassar', price: '80.000', rating: 4.9, image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1470&auto=format&fit=crop' },
    { id: 3, name: 'Minisoccer UINAM', category: 'Mini Soccer', location: 'Samata, Gowa', price: '250.000', rating: 4.7, image: 'https://images.unsplash.com/photo-1518605368461-1ee7c5320d2e?q=80&w=1470&auto=format&fit=crop' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 pb-24 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================= */}
        {/* HEADER & GREETING */}
        {/* ========================================= */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <p className="text-[#888888] font-medium text-sm mb-1">Selamat Pagi,</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {firstName}! Siap <span className="text-[#2FA084]">berkeringat?</span> 
            </h1>
          </div>
          <Link to="/notifications" className="relative p-3 bg-white rounded-full shadow-sm border border-[#EEEEEE] hover:border-[#2FA084] transition-colors group">
            <Bell className="w-5 h-5 text-[#444444] group-hover:text-[#2FA084]" />
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </Link>
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
        <div className="bg-[#111111] rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-lg mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="max-w-xs">
            <span className="bg-[#D4AF37] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-3 inline-block">Flash Sale</span>
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">Diskon 30% Booking Futsal Akhir Pekan!</h3>
            <p className="text-[#888888] text-xs">Gunakan kode: <span className="text-[#2FA084] font-bold">WEEKENDSERU</span></p>
          </div>
          <img src="https://ui-avatars.com/api/?name=%25&background=2FA084&color=fff&size=80&rounded=true" alt="Promo" className="w-16 h-16 sm:w-20 sm:h-20 animate-pulse" />
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {popularVenues.map((venue) => (
              <Link to="/booking" key={venue.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EEEEEE] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#111111] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    {venue.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#111111] text-lg mb-1">{venue.name}</h3>
                  <p className="text-[#888888] text-xs flex items-center gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5" /> {venue.location}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#F2C94C] fill-[#F2C94C]" />
                      <span className="font-bold text-[#111111] text-sm">{venue.rating}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#2FA084] font-black">Rp {venue.price}</span>
                      <span className="text-[10px] text-[#888888] font-normal"> /jam</span>
                    </div>
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