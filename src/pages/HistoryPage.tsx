import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, QrCode, ArrowRight, Package, Truck, ShoppingBag, MapPin, Ticket, AlertCircle, X, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // 1. IMPORT API SERVICE KITA

const getSportIcon = (sport: string) => {
  return <Trophy className="w-8 h-8" />;
};

const getSportColor = (sport: string) => {
  if (sport === 'Futsal' || sport === 'Mini Soccer') return 'bg-blue-50 text-blue-500 border-blue-100';
  if (sport === 'Badminton' || sport === 'Padel') return 'bg-orange-50 text-orange-500 border-orange-100';
  if (sport === 'Basket') return 'bg-red-50 text-red-500 border-red-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

export default function HistoryPage() {
  const navigate = useNavigate();
  
  const [mainCategory, setMainCategory] = useState<'booking' | 'store'>('booking');
  const [bookingTab, setBookingTab] = useState<'aktif' | 'selesai' | 'batal'>('aktif');
  const [storeTab, setStoreTab] = useState<'unpaid' | 'ready_to_pickup' | 'completed'>('ready_to_pickup');
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<any>(null);
  
  // State Review
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // State Review Store
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [storeRatings, setStoreRatings] = useState<Record<string, { rating: number; comment: string }>>({});
  const [isSubmittingStoreReview, setIsSubmittingStoreReview] = useState(false);

  // 2. UBAH BOOKING HISTORY JADI STATE
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [storeHistory, setStoreHistory] = useState<any[]>([]);

  // 3. EFEK PEMANGGILAN API KE LARAVEL
  useEffect(() => {
    const fetchRiwayat = async () => {
      setIsLoading(true);
      try {
        if (mainCategory === 'booking') {
          const response = await api.get('/history');
          if (response.success) {
            const dataAsli = response.data.map((item: any) => {
              let uiStatus = 'aktif';
              if (item.status === 'cancelled' || item.status === 'expire' || item.status === 'deny') uiStatus = 'batal';
              if (item.status === 'completed') uiStatus = 'selesai';
              return {
                id: `LNR-${item.id}`,
                status: uiStatus,
                real_status: item.status, // simpan status asli
                is_reviewed: item.is_reviewed,
                venue_id: item.venue_id,
                real_id: item.id,
                venue: item.court?.name || 'Lapangan',
                sport: item.court?.type || 'Futsal',
                date: item.booking_date,
                time: Array.isArray(item.time_slots) ? item.time_slots.join(', ') : item.time_slots,
                price: `Rp ${item.total_price?.toLocaleString('id-ID')}`
              };
            });
            setBookingHistory(dataAsli);
          }
        } else {
          // Tembak /user/orders untuk tab store
          const response = await api.get('/user/orders');
          if (response.success) {
            const orderData = response.data.map((item: any) => {
              const firstItem = item.items?.[0];
              const product = firstItem?.product;
              return {
                id: `ORD-${item.id}`,
                real_id: item.id,
                status: item.status, // unpaid, ready_to_pickup, completed
                is_reviewed: item.is_reviewed,
                items: item.items,
                product: product?.name || 'Paket Kantin',
                variant: `Order: ${item.items?.length || 0} Jenis Barang`,
                qty: firstItem?.quantity || 1,
                price: `Rp ${item.total_price?.toLocaleString('id-ID')}`,
                icon: <ShoppingBag className="w-10 h-10 text-blue-500" />
              };
            });
            setStoreHistory(orderData);
          }
        }
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiwayat();
  }, [mainCategory]);

  const filteredBooking = bookingHistory.filter(item => item.status === bookingTab);
  const filteredStore = storeHistory.filter(item => item.status === storeTab);

  const handleBookingLagi = () => {
    navigate('/booking'); 
  };
  
  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    setIsSubmittingReview(true);
    try {
      const response = await api.post('/reviews', {
        booking_id: reviewBooking.real_id,
        venue_id: reviewBooking.venue_id,
        rating,
        comment
      });
      if (response.success) {
        // Update local state to mark as reviewed
        setBookingHistory(prev => prev.map(item => 
          item.real_id === reviewBooking.real_id ? { ...item, is_reviewed: true } : item
        ));
        setReviewBooking(null);
        setRating(5);
        setComment('');
        alert('Terima kasih atas ulasan Anda!');
      } else {
        alert(response.message || 'Gagal mengirim ulasan');
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openStoreReviewModal = (order: any) => {
    setReviewOrder(order);
    const initialRatings: Record<string, { rating: number; comment: string }> = {};
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        initialRatings[item.product_id] = { rating: 5, comment: '' };
      });
    }
    setStoreRatings(initialRatings);
  };

  const handleStoreRatingChange = (productId: string, newRating: number) => {
    setStoreRatings(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating: newRating }
    }));
  };

  const handleStoreCommentChange = (productId: string, newComment: string) => {
    setStoreRatings(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment: newComment }
    }));
  };

  const handleSubmitStoreReview = async () => {
    if (!reviewOrder) return;
    setIsSubmittingStoreReview(true);
    try {
      const reviewsData = Object.keys(storeRatings).map(productId => ({
        product_id: parseInt(productId, 10),
        rating: storeRatings[productId].rating,
        comment: storeRatings[productId].comment,
      }));

      const response = await api.post('/product-reviews', {
        order_id: reviewOrder.id, // e.g. ORD-12
        reviews: reviewsData
      });

      if (response.success) {
        // Update local state to mark as reviewed
        setStoreHistory(prev => prev.map(item => 
          item.real_id === reviewOrder.real_id ? { ...item, is_reviewed: true } : item
        ));
        setReviewOrder(null);
        setStoreRatings({});
        alert('Terima kasih atas ulasan produk Anda!');
      } else {
        alert(response.message || 'Gagal mengirim ulasan produk');
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmittingStoreReview(false);
    }
  };

  // KOMPONEN SKELETON
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-[#EEEEEE] p-5 flex flex-col sm:flex-row gap-5 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-[#EEEEEE] animate-pulse flex-shrink-0"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="space-y-2">
          <div className="h-5 bg-[#EEEEEE] rounded-md w-3/4 animate-pulse"></div>
          <div className="h-3 bg-[#EEEEEE] rounded-md w-1/3 animate-pulse"></div>
        </div>
        <div className="flex gap-4 pt-2">
          <div className="h-3 bg-[#EEEEEE] rounded-md w-1/4 animate-pulse"></div>
          <div className="h-3 bg-[#EEEEEE] rounded-md w-1/4 animate-pulse"></div>
        </div>
      </div>
      <div className="w-full sm:w-28 h-12 bg-[#EEEEEE] rounded-xl mt-3 sm:mt-0 animate-pulse"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 pb-24 font-sans relative">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Riwayat <span className="text-[#2FA084]">Transaksi.</span>
          </h1>
          <p className="text-[#888888] mt-2 text-sm sm:text-base">
            Kelola semua pesanan tiket lapangan dan pembelian perlengkapan olahraga Anda di satu tempat.
          </p>
        </div>

        {/* TAB UTAMA (BOOKING VS STORE) */}
        <div className="flex bg-[#EEEEEE] p-1.5 rounded-2xl mb-8 shadow-inner">
          <button type="button" 
            onClick={() => setMainCategory('booking')}
            className={`flex-1 py-3 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${mainCategory === 'booking' ? 'bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-[#888888] hover:text-[#111111]'}`}
          >
            <Ticket className="w-4 h-4" /> Tiket Lapangan
          </button>
          <button type="button" 
            onClick={() => setMainCategory('store')}
            className={`flex-1 py-3 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${mainCategory === 'store' ? 'bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-[#888888] hover:text-[#111111]'}`}
          >
            <ShoppingBag className="w-4 h-4" /> Belanja Store
          </button>
        </div>

        {/* --- KONTEN TIKET LAPANGAN (BOOKING) --- */}
        {mainCategory === 'booking' && (
          <div className="animate-fade-in">
            {/* Sub-Tab Booking */}
            <div className="flex bg-white rounded-xl p-1.5 border border-[#EEEEEE] shadow-sm mb-6">
              {['aktif', 'selesai', 'batal'].map((tab) => (
                <button type="button" 
                  key={tab}
                  onClick={() => setBookingTab(tab as any)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg capitalize transition-all ${
                    bookingTab === tab 
                    ? (tab === 'batal' ? 'bg-red-50 text-red-600 border border-red-100' : tab === 'selesai' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-[#F0FDF8] text-[#2FA084] border border-[#2FA084]/20') 
                    : 'text-[#888888] hover:bg-[#F8F8F8]'
                  }`}
                >
                  {tab === 'batal' ? 'Dibatalkan' : tab === 'aktif' ? 'Tiket Aktif' : tab}
                </button>
              ))}
            </div>

            {/* List Booking */}
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : filteredBooking.length > 0 ? (
                filteredBooking.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-[#EEEEEE] flex flex-col sm:flex-row shadow-sm hover:shadow-lg transition-shadow animate-fade-in overflow-hidden group">
                    
                    <div className="p-5 flex-1 flex flex-col sm:flex-row gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-2xl shadow-inner border ${getSportColor(item.sport)}`}>
                        {getSportIcon(item.sport)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-extrabold text-[#111111] text-lg leading-tight">{item.venue}</h3>
                            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mt-1">Order ID: {item.id}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm mt-3 bg-[#F8F8F8] p-3 rounded-xl border border-[#EEEEEE] w-fit">
                          <div className="flex items-center gap-2 text-[#444444] font-medium"><Calendar className="w-4 h-4 text-[#2FA084]" /> {item.date}</div>
                          <div className="hidden sm:block w-1 h-1 bg-[#CCCCCC] rounded-full"></div>
                          <div className="flex items-center gap-2 text-[#444444] font-medium"><Clock className="w-4 h-4 text-[#2FA084]" /> {item.time}</div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col justify-center items-center px-0 relative">
                      <div className="w-px h-full border-l-2 border-dashed border-[#CCCCCC]"></div>
                      <div className="absolute top-[-12px] w-6 h-6 rounded-full bg-[#F8F8F8] border-b border-[#EEEEEE]"></div>
                      <div className="absolute bottom-[-12px] w-6 h-6 rounded-full bg-[#F8F8F8] border-t border-[#EEEEEE]"></div>
                    </div>

                    <div className="p-5 bg-[#FAFAFA] flex flex-col sm:justify-center items-center sm:w-48 border-t sm:border-t-0 sm:border-l-0 border-[#EEEEEE] relative">
                      <div className="w-full text-center sm:text-right mb-4 sm:mb-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                        <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider mb-0.5">Total Bayar</p>
                        <p className={`font-black text-lg ${item.status === 'batal' ? 'text-[#888888] line-through' : 'text-[#2FA084]'}`}>{item.price}</p>
                      </div>
                      
                      {/* LOGIKA TOMBOL BERDASARKAN STATUS */}
                      {item.status === 'aktif' ? (
                        item.real_status === 'pending' ? (
                          <div className="w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 px-4 py-3 rounded-xl text-xs font-bold shadow-sm">
                            Menunggu Pembayaran
                          </div>
                        ) : (
                          <button type="button" 
                            onClick={() => setSelectedQR(item)} // Membuka Modal QR dengan data spesifik
                            className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-[#2FA084] transition-colors shadow-md group-hover:-translate-y-0.5"
                          >
                            <QrCode className="w-4 h-4" /> Tampilkan QR
                          </button>
                        )
                      ) : item.status === 'selesai' ? (
                        <div className="w-full flex flex-col gap-2">
                          {!item.is_reviewed && (
                            <button type="button" 
                              onClick={() => setReviewBooking(item)}
                              className="w-full flex items-center justify-center gap-2 bg-[#2FA084] text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-[#1F6F5F] transition-colors shadow-sm"
                            >
                              ⭐ Beri Ulasan
                            </button>
                          )}
                          <button type="button" 
                            onClick={handleBookingLagi}
                            className="w-full flex items-center justify-center gap-2 bg-white text-[#111111] border border-[#CCCCCC] px-4 py-3 rounded-xl text-xs font-bold hover:bg-[#F8F8F8] hover:border-[#111111] transition-colors shadow-sm"
                          >
                            Booking Lagi
                          </button>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-1.5 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-red-100">
                          <XCircle className="w-4 h-4" /> Dibatalkan
                        </div>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <div className="p-12 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-[#EEEEEE] animate-fade-in">
                  <AlertCircle className="w-12 h-12 text-[#CCCCCC] mb-3" />
                  <h3 className="text-[#111111] font-bold text-lg mb-1">Tidak ada tiket {bookingTab}</h3>
                  <p className="text-[#888888] text-sm">Ayo mulai cari lawan mabar dan booking lapangan sekarang!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- KONTEN STORE (BELANJA) --- */}
        {mainCategory === 'store' && (
          <div className="animate-fade-in">
            <div className="flex bg-white rounded-xl p-1.5 border border-[#EEEEEE] shadow-sm mb-6">
              {['unpaid', 'ready_to_pickup', 'completed'].map((tab) => (
                <button type="button" 
                  key={tab} 
                  onClick={() => setStoreTab(tab as any)} 
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg capitalize transition-all ${
                    storeTab === tab 
                    ? (tab === 'unpaid' ? 'bg-[#FFF9E6] text-[#F2994A] border border-[#F2994A]/20' : tab === 'ready_to_pickup' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-[#F0FDF8] text-[#2FA084] border border-[#2FA084]/20') 
                    : 'text-[#888888] hover:bg-[#F8F8F8]'
                  }`}
                >
                  {tab === 'unpaid' ? 'Belum Bayar' : tab === 'ready_to_pickup' ? 'Siap Diambil' : 'Selesai'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : filteredStore.length > 0 ? (
                filteredStore.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-[#EEEEEE] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                    
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#EEEEEE]">
                      <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">No. Pesanan: {item.id}</p>
                      {item.status === 'unpaid' && <span className="bg-[#FFF9E6] text-[#F2994A] border border-[#F2994A]/20 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"><Package className="w-3.5 h-3.5"/> Belum Bayar</span>}
                      {item.status === 'ready_to_pickup' && <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"><ShoppingBag className="w-3.5 h-3.5"/> Siap Diambil di Kasir</span>}
                      {item.status === 'completed' && <span className="bg-[#F0FDF8] text-[#2FA084] border border-[#2FA084]/20 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"><CheckCircle className="w-3.5 h-3.5"/> Pesanan Selesai</span>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      <div className="w-20 h-20 bg-[#F8F8F8] rounded-2xl flex items-center justify-center text-4xl border border-[#EEEEEE] shadow-inner shrink-0">{item.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-[#111111] text-lg leading-tight mb-1">{item.product}</h4>
                        <p className="text-xs font-semibold text-[#888888] bg-[#F8F8F8] px-2 py-1 rounded-md w-max border border-[#EEEEEE]">{item.variant}</p>
                        
                        {item.status === 'completed' && !item.is_reviewed && (
                          <div className="mt-3">
                            <button type="button" 
                              onClick={() => openStoreReviewModal(item)}
                              className="text-xs bg-[#2FA084] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#1F6F5F] transition-colors"
                            >
                              ⭐ Beri Ulasan Produk
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0">
                        <p className="text-[10px] text-[#888888] font-bold uppercase mb-0.5 tracking-wider">Total Belanja</p>
                        <p className="font-black text-[#111111] text-xl">{item.price}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-[#EEEEEE] animate-fade-in">
                  <ShoppingBag className="w-12 h-12 text-[#CCCCCC] mb-3" />
                  <h3 className="text-[#111111] font-bold text-lg mb-1">Belum ada pesanan</h3>
                  <p className="text-[#888888] text-sm">Cek Store kami untuk perlengkapan olahraga terbaik!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL POP-UP QR TIKET */}
      {/* ========================================= */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative transform transition-all animate-fade-in">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#2FA084] to-[#1F6F5F] p-5 text-center relative">
              <button type="button" 
                onClick={() => setSelectedQR(null)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-white font-bold text-lg">Tiket Masuk</h3>
              <p className="text-white/80 text-xs mt-0.5">Tunjukkan layar ini ke petugas venue</p>
            </div>
            
            {/* Body Modal (Isi QR Code Real) */}
            <div className="p-8 flex flex-col items-center">
              <div className="p-4 bg-white border-2 border-dashed border-[#2FA084]/30 rounded-2xl mb-5 shadow-sm">
                {/* QR Code Dinamis berdasarkan ID Transaksi */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedQR.id}-LUNARASPORTS`} 
                  alt="QR Code Ticket" 
                  className="w-48 h-48" 
                />
              </div>
              <h4 className="font-mono font-bold text-2xl tracking-widest text-[#111111] mb-1">{selectedQR.id}</h4>
              <p className="text-[#888888] text-sm font-medium text-center">{selectedQR.venue}</p>
              <p className="text-[#2FA084] text-xs font-bold mt-3 bg-[#2FA084]/10 px-4 py-1.5 rounded-full border border-[#2FA084]/20">
                Valid & Sudah Dibayar
              </p>
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL REVIEW TIKET LAPANGAN */}
      {/* ========================================= */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative transform transition-all animate-fade-in">
            <div className="bg-[#111111] p-5 text-center relative">
              <button type="button" 
                onClick={() => setReviewBooking(null)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-white font-bold text-lg">Beri Ulasan Venue</h3>
              <p className="text-white/80 text-xs mt-0.5">{reviewBooking.venue}</p>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              <p className="text-[#111111] font-bold mb-4">Seberapa puas kamu bermain di sini?</p>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button type="button" 
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <svg className={`w-10 h-10 ${star <= rating ? 'text-[#F2C94C] fill-[#F2C94C]' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                ))}
              </div>

              <div className="w-full mb-6">
                <label className="block text-sm font-bold text-[#111111] mb-2">Komentar Tambahan (Opsional)</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl p-3 text-sm focus:outline-none focus:border-[#2FA084] min-h-[100px]"
                  placeholder="Ceritakan pengalaman bermainmu..."
                ></textarea>
              </div>

              <button type="button" 
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="w-full bg-[#2FA084] text-white font-bold py-3.5 rounded-xl hover:bg-[#1F6F5F] transition-all disabled:opacity-50"
              >
                {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL REVIEW STORE PRODUCTS */}
      {/* ========================================= */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative transform transition-all animate-fade-in max-h-[90vh] flex flex-col">
            <div className="bg-[#111111] p-5 text-center relative shrink-0">
              <button type="button" 
                onClick={() => setReviewOrder(null)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-white font-bold text-lg">Beri Ulasan Produk</h3>
              <p className="text-white/80 text-xs mt-0.5">Pesanan {reviewOrder.id}</p>
            </div>
            
            <div className="p-6 overflow-y-auto grow">
              <p className="text-[#888888] text-sm mb-4 text-center">Beri rating untuk barang yang kamu beli.</p>
              
              {reviewOrder.items?.map((item: any) => {
                const pId = item.product_id;
                const rData = storeRatings[pId] || { rating: 5, comment: '' };
                
                return (
                  <div key={item.id} className="mb-6 p-4 bg-[#F8F8F8] rounded-2xl border border-[#EEEEEE]">
                    <h4 className="font-bold text-[#111111] mb-2">{item.product?.name || 'Produk'}</h4>
                    <div className="flex gap-1.5 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button type="button" 
                          key={star}
                          onClick={() => handleStoreRatingChange(pId, star)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <svg className={`w-6 h-6 ${star <= rData.rating ? 'text-[#F2C94C] fill-[#F2C94C]' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={rData.comment}
                      onChange={(e) => handleStoreCommentChange(pId, e.target.value)}
                      className="w-full bg-white border border-[#EEEEEE] rounded-xl p-3 text-sm focus:outline-none focus:border-[#2FA084] min-h-[60px]"
                      placeholder={`Ulasan untuk ${item.product?.name || 'produk ini'} (opsional)...`}
                    ></textarea>
                  </div>
                );
              })}
            </div>
            <div className="p-5 border-t border-[#EEEEEE] shrink-0">
              <button type="button" 
                onClick={handleSubmitStoreReview}
                disabled={isSubmittingStoreReview}
                className="w-full bg-[#2FA084] text-white font-bold py-3.5 rounded-xl hover:bg-[#1F6F5F] transition-all disabled:opacity-50"
              >
                {isSubmittingStoreReview ? 'Mengirim...' : 'Kirim Semua Ulasan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}