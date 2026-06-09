import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

// 1. IMPORT GAMBAR LOKAL KAMU DARI FOLDER ASSETS
import imgBultang from '../assets/hero-bultang.png';
import imgFutsal from '../assets/hero-futsal.png';
import imgPadel from '../assets/hero-padel.png';
import imgBasket from '../assets/hero-basket.png';

export default function Hero() {
  // State untuk melacak urutan gambar yang sedang menyala
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array urutan gambar yang akan di-loop
  const sportsImages = [
    { id: 1, src: imgBultang, alt: "Siluet Badminton" },
    { id: 2, src: imgFutsal, alt: "Siluet Futsal/Minsoc" },
    { id: 3, src: imgPadel, alt: "Siluet Padel" },
    { id: 4, src: imgBasket, alt: "Siluet Basket" },
  ];

  // Efek Timer untuk mengganti gambar setiap 4 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === sportsImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // 4000ms = 4 detik

    return () => clearInterval(timer);
  }, [sportsImages.length]);

  return (
    <section className="w-full bg-[#EEEEEE] py-12 md:py-20 lg:py-24 overflow-hidden">
     <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1.2fr_1fr] lg:grid-cols-2 gap-12 items-center">
        
        {/* KOLOM KIRI: Teks & Tombol */}
        <div className="flex flex-col items-start gap-6 z-10 relative">
          <div className="inline-flex items-center gap-2 bg-[#D1E9E3] text-[#1F6F5F] px-4 py-1.5 rounded-full text-sm font-semibold shadow-inner border border-[#6FCF97]/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2FA084] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2FA084]"></span>
            </span>
            Platform Booking No.1 di Makassar
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] leading-[1.1] tracking-tight">
            MAIN LEBIH <br /> 
            <span className="text-[#2FA084]">MUDAH & KEREN</span>
          </h1>

          <p className="text-base sm:text-lg text-[#444444] max-w-[540px] leading-relaxed">
            Temukan dan pesan lapangan Badminton, Futsal, Padel, atau Basket favoritmu dalam hitungan detik. Kelola jadwal main jadi lebih praktis, kapan saja.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="group bg-[#2FA084] hover:bg-[#1F6F5F] transition-colors text-white text-base font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2.5">
              Pesan Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      {/* KOLOM KANAN: Slideshow Ilustrasi Fade */}
        {/* Perubahan: md:h-full diganti jadi md:h-[550px] agar wadah tidak kempes */}
        <div className="relative w-full h-[400px] sm:h-[500px] md:h-[550px] flex justify-center items-center md:justify-end">
          
          {/* Background Bulat Hijau (Dekorasi) */}
          <div className="absolute top-1/2 left-1/2 md:left-2/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-[#6FCF97] rounded-full opacity-15 blur-3xl z-0"></div>
          
          {/* Tumpukan 4 Gambar Siluet */}
          <div className="relative z-10 w-full max-w-[600px] h-full flex items-center justify-center">
            {sportsImages.map((image, index) => (
              <img 
                key={image.id}
                src={image.src} 
                alt={image.alt} 
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out
                           ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}