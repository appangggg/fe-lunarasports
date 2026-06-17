import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { api } from '../services/api';  // [FIX TUGAS 4] Import api service yang sudah ada Bearer Token interceptor

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, addToCart, decreaseQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  
  // State untuk efek loading saat tombol diklik
  const [isProcessing, setIsProcessing] = useState(false);

  // Fungsi untuk mengirim data keranjang ke Laravel
 const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    // 1. Tarik data user yang sedang login dari memori browser
    const userStorage = localStorage.getItem('user');
    const userData = userStorage ? JSON.parse(userStorage) : null;

    // Jika belum login, minta login dulu
    if (!userData) {
      alert("Silakan login terlebih dahulu untuk melakukan pembayaran.");
      setIsProcessing(false);
      return;
    }

    // 2. Payload yang dikirim ke backend
    const payload = {
      customer_name:  userData.name,
      customer_email: userData.email,
      total_price:    getTotalPrice(),
      items: items.map(item => ({
        id:       item.id,
        quantity: item.quantity,
        price:    item.price
      }))
    };

    try {
      // [FIX TUGAS 4] Ganti fetch() hardcoded ke api.post() yang sudah include:
      // - VITE_API_BASE_URL dari .env (bukan URL hardcoded 127.0.0.1)
      // - Header Authorization: Bearer {token} secara otomatis
      // - Proper error handling termasuk redirect saat 401
      const result = await api.post('/orders', payload);

      if (result.success) {
        // Panggil pop-up Midtrans menggunakan snap_token dari Laravel
        // @ts-ignore (Mengabaikan error TypeScript karena window.snap berasal dari script HTML)
        window.snap.pay(result.snap_token, {
          onSuccess: function(_result: any) {
            alert("Pembayaran Berhasil! Pesananmu sedang diproses.");
            clearCart();
            onClose();
          },
          onPending: function(_result: any) {
            alert("Menunggu pembayaranmu! Selesaikan dalam 24 jam.");
            clearCart();
            onClose();
          },
          onError: function(_result: any) {
            alert("Pembayaran Gagal! Coba lagi atau hubungi CS.");
          },
          onClose: function() {
            // User menutup popup tanpa bayar — tidak perlu alert
            console.warn('User menutup popup Midtrans tanpa menyelesaikan pembayaran.');
          }
        });
      } else {
        alert('Gagal membuat pesanan: ' + (result.message || 'Cek kembali datamu.'));
      }
    } catch (error: any) {
      console.error('CartDrawer checkout error:', error);
      alert('Terjadi kesalahan: ' + (error.message || 'Periksa koneksi internetmu.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Jika laci ditutup, jangan tampilkan apa-apa (hanya hidden style)
  const drawerClasses = isOpen ? "translate-x-0" : "translate-x-full";
  const overlayClasses = isOpen ? "opacity-100 visible" : "opacity-0 invisible";

  return (
    <>
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-all duration-300 ${overlayClasses}`}
      />

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${drawerClasses}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2FA084]" />
            <h2 className="text-lg font-extrabold text-[#111111]">Keranjang Belanja</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-[#F8F8F8] hover:bg-[#EEEEEE] rounded-full transition-colors text-[#888888]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[#F8F8F8] rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[#CCCCCC]" />
              </div>
              <h3 className="text-lg font-bold text-[#111111] mb-1">Keranjang masih kosong</h3>
              <p className="text-[#888888] text-sm">Yuk, temukan perlengkapan olahraga favoritmu!</p>
              <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-[#2FA084] text-white font-semibold rounded-full hover:bg-[#1F6F5F] transition-colors text-sm">
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-[#F8F8F8] rounded-xl overflow-hidden shrink-0 border border-[#EEEEEE] flex items-center justify-center p-2">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#111111] line-clamp-2 leading-tight mb-1">{item.name}</h4>
                      <p className="text-[#2FA084] font-extrabold text-sm">Rp {Number(item.price).toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-lg px-2 py-1">
                        <button onClick={() => decreaseQuantity(item.id)} className="text-[#888888] hover:text-[#111111] p-1">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-[#111111] w-4 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="text-[#888888] hover:text-[#111111] p-1">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-[#FF4D4D] hover:text-white hover:bg-[#FF4D4D] p-1.5 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#EEEEEE] shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#888888] font-medium">Total Harga</span>
              <span className="text-xl font-extrabold text-[#111111]">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
            </div>
            {/* Tombol yang sudah dihubungkan dengan handleCheckout */}
            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-[#111111] hover:bg-[#2FA084] disabled:bg-[#CCCCCC] disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                </>
              ) : (
                'Lanjut ke Pembayaran'
              )}
            </button>
            <button onClick={clearCart} className="w-full text-center text-xs font-semibold text-[#888888] hover:text-[#FF4D4D] mt-4 transition-colors">
              Kosongkan Keranjang
            </button>
          </div>
        )}
        
      </div>
    </>
  );
}