import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Calendar, ShieldCheck } from 'lucide-react';
// Tambahkan baris ini:
import logoLunara from '../assets/logo-lunara.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ name: 'User' });
  const location = useLocation();
  const navigate = useNavigate();

  // Efek ini akan mengecek token setiap kali pindah halaman
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userStorage = localStorage.getItem('user');
      if (userStorage) setUserData(JSON.parse(userStorage));
    } else {
      setIsLoggedIn(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/welcome');
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Booking', path: '/booking' },
    { name: 'Mabar', path: '/mabar' },
    { name: 'Store', path: '/store' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-[#EEEEEE] fixed w-full z-50 top-0 transition-all shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
        {/* LOGO */}
          <Link to={isLoggedIn ? "/" : "/welcome"} className="flex items-center gap-2">
            <img 
              src={logoLunara} 
              alt="Logo Lunara Sports" 
              className="h-8 w-auto object-contain" 
            />
            <span className="text-xl font-black tracking-tighter text-[#111111]">
              LUNARA<span className="text-[#2FA084]">SPORTS</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={isLoggedIn ? link.path : '/login'} // Kalau belum login, semua menu diarahkan ke login
                className={`text-sm font-bold transition-colors ${
                  location.pathname === link.path ? 'text-[#2FA084]' : 'text-[#888888] hover:text-[#111111]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* RIGHT ICONS (Logika Cerdas: Cek Login/Belum) */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/notifications" className="p-2 text-[#888888] hover:text-[#2FA084] transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 pl-3 py-1.5 pr-1.5 rounded-full border border-[#EEEEEE] hover:border-[#2FA084] transition-all bg-[#F8F8F8]"
                >
                  <span className="text-xs font-bold text-[#444444] hidden lg:block">{userData.name.split(' ')[0]}</span>
                  <div className="w-8 h-8 bg-[#2FA084] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {userData.name.charAt(0)}
                  </div>
                </button>

                {/* DROPDOWN PROFILE */}
                {showProfile && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#EEEEEE] py-2 animate-fade-in">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#444444] hover:bg-[#F8F8F8] hover:text-[#2FA084]"><User className="w-4 h-4" /> Profil Saya</Link>
                    <Link to="/history" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#444444] hover:bg-[#F8F8F8] hover:text-[#2FA084]"><Calendar className="w-4 h-4" /> Tiket & Riwayat</Link>
                    {(userData as any).role === 'superadmin' && (
                      <Link to="/superadmin/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#D4AF37] hover:bg-[#F8F8F8] hover:text-[#B89600]">
                        <ShieldCheck className="w-4 h-4" /> Superadmin
                      </Link>
                    )}
                    <div className="h-px bg-[#EEEEEE] my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 text-left">
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAMPILAN JIKA BELUM LOGIN */
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-[#111111] text-sm font-bold hover:text-[#2FA084] transition-colors">
                Masuk
              </Link>
              <Link to="/register" className="bg-[#2FA084] hover:bg-[#1F6F5F] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors shadow-sm">
                Daftar Sekarang
              </Link>
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#111111] p-1">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER (Cerdas) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-[#EEEEEE] absolute w-full shadow-xl animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={isLoggedIn ? link.path : '/login'}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-sm text-[#444444] hover:bg-[#F8F8F8]"
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-[#EEEEEE] my-4"></div>
            
            {isLoggedIn ? (
              <>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-sm text-[#444444] hover:bg-[#F8F8F8]">Profil Saya</Link>
                {(userData as any).role === 'superadmin' && (
                  <Link to="/superadmin/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-sm text-[#D4AF37] hover:bg-[#F8F8F8]">Panel Superadmin</Link>
                )}
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50">Keluar Akun</button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-2">
                <Link to="/login" className="w-full py-3 rounded-xl font-bold text-sm text-center border border-[#EEEEEE] text-[#444444]">Masuk</Link>
                <Link to="/register" className="w-full py-3 rounded-xl font-bold text-sm text-center bg-[#2FA084] text-white">Daftar Sekarang</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}