import { Star, MapPin } from 'lucide-react';

export default function FeaturedLapangan() {
  // Data sementara (Nanti data ini akan diambil dari Laravel API)
  const lapangans = [
    {
      id: 1,
      name: 'GOR Cempaka Putih',
      kategori: 'Badminton',
      lokasi: 'Panakkukang, Makassar',
      rating: 4.9,
      harga: 'Rp 80.000',
      image: 'https://placehold.co/600x340/EEEEEE/444444?text=Foto+Badminton' // Nanti bisa diganti foto asli
    },
    {
      id: 2,
      name: 'Arena Futsal Kuningan',
      kategori: 'Futsal',
      lokasi: 'Tamalanrea, Makassar',
      rating: 4.8,
      harga: 'Rp 150.000',
      image: 'https://placehold.co/600x340/EEEEEE/444444?text=Foto+Futsal'
    },
    {
      id: 3,
      name: 'Makassar Padel Center',
      kategori: 'Padel',
      lokasi: 'Manggala, Makassar',
      rating: 5.0,
      harga: 'Rp 200.000',
      image: 'https://placehold.co/600x340/EEEEEE/444444?text=Foto+Padel'
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#F8F8F8]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111111] tracking-tight mb-3">
              Rekomendasi Lapangan
            </h2>
            <p className="text-[#888888] text-base">Venue dengan rating tertinggi yang siap kamu gunakan.</p>
          </div>
          <a href="/booking" className="text-[#2FA084] font-semibold hover:text-[#1F6F5F] transition-colors flex items-center gap-1">
            Lihat Semua <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        {/* Grid Lapangan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {lapangans.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(47,160,132,0.15)] transition-all duration-300 cursor-pointer group"
            >
              {/* Foto Lapangan */}
              <div className="relative h-[200px] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge Kategori */}
                <div className="absolute top-4 left-4 bg-[#6FCF97]/90 backdrop-blur-sm text-[#1F6F5F] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {item.kategori}
                </div>
              </div>

              {/* Info Lapangan */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#111111] mb-2">{item.name}</h3>
                <div className="flex items-center gap-1.5 text-[#888888] text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{item.lokasi}</span>
                </div>
                
                <div className="border-t border-[#EEEEEE] pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-[#F2C94C] fill-[#F2C94C]" />
                    <span className="font-semibold text-[#111111]">{item.rating}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#888888] block">Mulai dari</span>
                    <span className="text-[#2FA084] font-bold">{item.harga}<span className="text-sm font-normal text-[#888888]">/jam</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}