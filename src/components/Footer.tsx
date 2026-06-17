import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
// Tambahkan baris ini:
import logoLunara from '../assets/logo-lunara.png';
export default function Footer() {
  return (
    <footer className="bg-[#111111] pt-16 pb-8 font-sans border-t-4 border-[#2FA084]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
         {/* Kolom 1: Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img 
                src={logoLunara} 
                alt="Logo Lunara Sports" 
                className="h-8 w-auto object-contain brightness-0 invert" 
              />
              <span className="text-xl font-black tracking-tighter text-white">
                LUNARA<span className="text-[#2FA084]">SPORTS</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Sistem manajemen arena olahraga terpadu. Booking lapangan, cari lawan sparring, dan lengkapi gear olahragamu dalam satu genggaman.
            </p>
            {/* Sosmed diganti pakai inisial teks yang minimalis */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#2FA084] transition-colors font-bold text-xs tracking-wider">IG</a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#2FA084] transition-colors font-bold text-xs tracking-wider">X</a>
            </div>
          </div>

          {/* Kolom 2: Layanan */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Layanan Kami</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link to="/booking" className="hover:text-[#2FA084] transition-colors">Booking Lapangan</Link></li>
              <li><Link to="/mabar" className="hover:text-[#2FA084] transition-colors">Cari Lawan / Mabar</Link></li>
              <li><Link to="/store" className="hover:text-[#2FA084] transition-colors">Toko Perlengkapan</Link></li>
              <li><Link to="/history" className="hover:text-[#2FA084] transition-colors">Cek E-Tiket</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Perusahaan */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Perusahaan</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><a href="#" className="hover:text-[#2FA084] transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-[#2FA084] transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-[#2FA084] transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-[#2FA084] transition-colors">Pusat Bantuan</a></li>
            </ul>
          </div>

          {/* Kolom 4: Kontak */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2FA084] shrink-0" />
                <span>Samata, Kabupaten Gowa, Sulawesi Selatan, Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#2FA084] shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#2FA084] shrink-0" />
                <span>hello@lunarasports.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-medium">
            &copy; 2026 Lunara Sports. Crafted with <span className="text-red-500">♥</span> by Muh. Asyfar.
          </p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/2560px-Gopay_logo.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0" alt="Gopay" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/MasterCard_Logo.svg/1024px-MasterCard_Logo.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0" alt="Mastercard" />
          </div>
        </div>
      </div>
    </footer>
  );
}