import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Frown, ArrowUpDown, CheckCircle2, Map } from 'lucide-react';
import BookingModal from '../components/BookingModal';

const categories = ['Semua', 'Badminton', 'Futsal', 'Mini Soccer', 'Padel', 'Basket'];

export default function BookingPage() {
  const [lapangans, setLapangans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState('rekomendasi'); 

  const [selectedLapangan, setSelectedLapangan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Simulasi loading sedikit agar efek skeleton premium terlihat
    setIsLoading(true);
    fetch('http://127.0.0.1:8000/api/venues')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formattedData = data.data.map((item: any) => ({
            ...item,
            hargaAngka: item.harga_mulai,
            fasilitasUtama: item.fasilitas_utama || [],
            fasilitasLengkap: item.fasilitas_lengkap || [],
            peraturan: item.peraturan || [],
          }));
          setLapangans(formattedData);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Gagal menarik data:', error);
        setIsLoading(false);
      });
  }, []);

  const openModal = (lapangan: any) => {
    setSelectedLapangan(lapangan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLapangan(null);
  };

  const filteredAndSortedLapangans = lapangans
    .filter((lapangan) => {
      const matchCategory = activeCategory === 'Semua' || lapangan.kategori === activeCategory;
      const matchSearch = lapangan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lapangan.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'terbagus') return b.rating - a.rating;
      if (sortBy === 'termurah') return a.hargaAngka - b.hargaAngka;
      if (sortBy === 'terdekat') return a.jarak - b.jarak;
      return 0;
    });

  // =========================================
  // KOMPONEN SKELETON LOADING (UX Premium)
  // =========================================
  const SkeletonVenue = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-[#EEEEEE]">
      <div className="h-[200px] bg-[#F8F8F8] animate-pulse flex items-center justify-center shrink-0">
        <Map className="w-12 h-12 text-[#EEEEEE]" />
      </div>
      <div className="p-6 flex flex-col flex-grow gap-4">
        <div className="h-6 bg-[#EEEEEE] rounded-md w-3/4 animate-pulse"></div>
        <div className="h-4 bg-[#EEEEEE] rounded-md w-1/2 animate-pulse -mt-2"></div>
        <div className="flex gap-2 mt-2">
          <div className="h-6 bg-[#EEEEEE] rounded-md w-1/4 animate-pulse"></div>
          <div className="h-6 bg-[#EEEEEE] rounded-md w-1/4 animate-pulse"></div>
        </div>
        <div className="mt-auto border-t border-[#EEEEEE] pt-4 flex justify-between">
          <div className="h-5 bg-[#EEEEEE] rounded-md w-1/4 animate-pulse"></div>
          <div className="h-6 bg-[#EEEEEE] rounded-md w-1/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 pb-24 font-sans relative">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER & FILTER */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111111] mb-2 tracking-tight">
            Eksplorasi <span className="text-[#2FA084]">Arena.</span>
          </h1>
          <p className="text-[#888888] mb-8 text-sm md:text-base max-w-2xl">
            Temukan venue terbaik untuk pertandinganmu selanjutnya. Filter berdasarkan lokasi, harga, atau fasilitas.
          </p>

          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#EEEEEE] sticky top-24 z-30 transition-all hover:shadow-md">
            
            {/* Kategori Scroller */}
            <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar">
              {categories.map((kategori) => (
                <button
                  key={kategori}
                  onClick={() => setActiveCategory(kategori)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    activeCategory === kategori
                      ? 'bg-[#111111] text-white shadow-md transform scale-105'
                      : 'bg-[#F8F8F8] text-[#888888] hover:bg-[#EEEEEE] hover:text-[#444444] border border-[#EEEEEE]'
                  }`}
                >
                  {kategori}
                </button>
              ))}
            </div>

            {/* Sorting & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-[180px]">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-bold text-[#444444] appearance-none focus:outline-none focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 cursor-pointer transition-all"
                >
                  <option value="rekomendasi">Rekomendasi</option>
                  <option value="terbagus">Rating Terbagus</option>
                  <option value="termurah">Harga Termurah</option>
                  <option value="terdekat">Jarak Terdekat</option>
                </select>
              </div>

              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <input
                  type="text"
                  placeholder="Cari nama atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#EEEEEE] rounded-xl text-sm focus:outline-none focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AREA KONTEN: SKELETON / GRID LAPANGAN */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonVenue key={n} />
            ))}
          </div>
        ) : filteredAndSortedLapangans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
            {filteredAndSortedLapangans.map((item) => (
              <div 
                key={item.id} 
                onClick={() => openModal(item)}
                className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(47,160,132,0.15)] transition-all duration-300 cursor-pointer group flex flex-col border border-[#EEEEEE]"
              >
                {/* Header Gambar */}
                <div className="relative h-[220px] overflow-hidden shrink-0">
                  <img 
                    src={item.courts && item.courts.length > 0 ? item.courts[0].image : 'https://placehold.co/600x400/EEEEEE/AAAAAA?text=Gambar+Venue'} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#111111] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    {item.kategori}
                  </div>
                </div>

                {/* Konten Data */}
                <div className="p-6 flex flex-col flex-grow relative bg-white">
                  <h3 className="text-xl font-extrabold text-[#111111] mb-2 leading-tight group-hover:text-[#2FA084] transition-colors">{item.name}</h3>
                  
                  <div className="flex items-center gap-2 text-[#888888] text-sm mb-5">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate font-medium">{item.lokasi}</span>
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
                      <span className="font-bold text-[#111111] text-sm">{item.rating}</span>
                    </div>
                  {/* Tombol yang sebelumnya tidak ada */}
                      <button 
                        className="bg-[#111111] text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-[#2FA084] transition-colors shadow-sm"
                      >
                        Pilih Jadwal
                      </button>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-[#CCCCCC] animate-fade-in">
            <Frown className="w-16 h-16 text-[#CCCCCC] mb-5" />
            <h3 className="text-xl font-extrabold text-[#111111] mb-2">Venue Tidak Ditemukan</h3>
            <p className="text-[#888888] max-w-sm mx-auto">Kami tidak dapat menemukan lapangan dengan filter tersebut. Coba gunakan kata kunci lain.</p>
          </div>
        )}
      </div>
      
      {/* MODAL BOOKING TETAP AMAN */}
      <BookingModal isOpen={isModalOpen} onClose={closeModal} lapangan={selectedLapangan} />
    </div>  
  );
}