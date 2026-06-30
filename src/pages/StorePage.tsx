import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Star, Loader2, Frown, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore'; // Import Zustand Store
import CartDrawer from '../components/CartDrawer';

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rekomendasi');

  // Tarik fungsi dan data dari Zustand
  const { addToCart, getTotalItems } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const categories = ['Semua', 'Sepatu', 'Raket', 'Bola', 'Pakaian', 'Aksesoris'];

  useEffect(() => {
    // Simulasi loading tambahan sedikit agar efek skeleton terlihat elegan (Opsional, bisa dihapus)
    setIsLoading(true);
    fetch('http://127.0.0.1:8000/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Gagal menarik data produk:', error);
        setIsLoading(false);
      });
  }, []);

  // Fungsi saat tombol keranjang diklik
  const handleAddToCart = (product: any) => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchCategory = activeCategory === 'Semua' || product.category === activeCategory;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'terlaris') return b.sold - a.sold;
      if (sortBy === 'termurah') return a.price - b.price;
      if (sortBy === 'termahal') return b.price - a.price;
      return 0;
    });

  const totalItemsInCart = getTotalItems();

  // =========================================
  // KOMPONEN SKELETON LOADING
  // =========================================
  const SkeletonProduct = () => (
    <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden shadow-sm flex flex-col">
      <div className="aspect-square bg-[#F8F8F8] animate-pulse flex items-center justify-center">
        <ShoppingCart className="w-10 h-10 text-[#EEEEEE]" />
      </div>
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="h-3 bg-[#EEEEEE] rounded-md w-1/3 animate-pulse"></div>
        <div className="h-4 bg-[#EEEEEE] rounded-md w-3/4 animate-pulse"></div>
        <div className="h-3 bg-[#EEEEEE] rounded-md w-1/2 animate-pulse mb-2"></div>
        <div className="flex justify-between items-end mt-auto">
          <div className="h-5 bg-[#EEEEEE] rounded-md w-1/2 animate-pulse"></div>
          <div className="w-10 h-10 bg-[#EEEEEE] rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-20 pb-24 font-sans relative">
      
      {/* Toast Notifikasi Sukses yang Lebih Smooth */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in transition-all">
          <div className="bg-[#2FA084] rounded-full p-1">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Berhasil masuk keranjang!</span>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER & FILTER */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111111] mb-2 tracking-tight">
            Lunara Store
          </h1>
          <p className="text-[#888888] mb-8">Lengkapi kebutuhan olahragamu dengan perlengkapan terbaik.</p>

          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#EEEEEE] sticky top-20 z-40">
            <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar">
              {categories.map((kategori) => (
                <button
                  key={kategori}
                  onClick={() => setActiveCategory(kategori)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    activeCategory === kategori
                      ? 'bg-[#2FA084] text-white shadow-md'
                      : 'bg-[#EEEEEE] text-[#444444] hover:bg-[#D1E9E3] hover:text-[#1F6F5F]'
                  }`}
                >
                  {kategori}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-[180px]">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-[#F8F8F8] border border-[#CCCCCC] rounded-xl text-sm font-medium text-[#444444] appearance-none focus:outline-none focus:border-[#2FA084] focus:ring-1 focus:ring-[#2FA084] cursor-pointer transition-all"
                >
                  <option value="rekomendasi">Rekomendasi</option>
                  <option value="terlaris">Paling Laris</option>
                  <option value="termurah">Harga Termurah</option>
                  <option value="termahal">Harga Tertinggi</option>
                </select>
              </div>

              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
                <input
                  type="text"
                  placeholder="Cari merk atau nama produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8F8F8] border border-[#CCCCCC] rounded-xl text-sm focus:outline-none focus:border-[#2FA084] focus:ring-1 focus:ring-[#2FA084] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AREA KONTEN: SKELETON LOADING / GRID PRODUK */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Render 8 kotak skeleton sebagai simulasi data */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <SkeletonProduct key={n} />
            ))}
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
            {filteredAndSortedProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(47,160,132,0.12)] transition-all duration-300 group flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F8F8F8] shrink-0 p-4 flex items-center justify-center">
                  <img 
                    src={product.image || 'https://placehold.co/400x400/EEEEEE/888888?text=Produk'} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#111111] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-[#EEEEEE]">
                    {product.brand}
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <p className="text-xs text-[#888888] mb-1">{product.category}</p>
                  <h3 className="text-sm sm:text-base font-bold text-[#111111] mb-2 line-clamp-2 leading-tight group-hover:text-[#2FA084] transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-4 h-4 text-[#F2C94C] fill-[#F2C94C]" />
                    <span className="text-xs font-semibold text-[#111111]">{product.rating}</span>
                    <span className="text-[10px] text-[#888888] ml-1">({product.sold} terjual)</span>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[#2FA084] font-extrabold text-sm sm:text-lg tracking-tight">
                      Rp {Number(product.price).toLocaleString('id-ID')}
                    </span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-[#111111] hover:bg-[#2FA084] text-white p-2.5 rounded-xl transition-colors duration-200 shadow-sm active:scale-95 group/btn relative overflow-hidden"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <Frown className="w-16 h-16 text-[#CCCCCC] mb-4" />
            <h3 className="text-xl font-semibold text-[#444444] mb-2">Produk tidak ditemukan</h3>
            <p className="text-[#888888]">Coba gunakan kata kunci lain atau pilih kategori Semua.</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItemsInCart > 0 && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-[#2FA084] hover:bg-[#1F6F5F] text-white p-4 rounded-full shadow-[0_8px_24px_rgba(47,160,132,0.4)] transition-transform hover:scale-105 active:scale-95 flex items-center justify-center relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
              {totalItemsInCart}
            </span>
          </button>
        </div>
      )}

      {/* Laci Keranjang */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}