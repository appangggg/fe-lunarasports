import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus, X, ShoppingBag, Trash2, Tag, Coffee, Package } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  is_rental: boolean;
}

interface CartItem extends Product {
  qty: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  unpaid:          { label: 'Menunggu Pembayaran',      color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200'   },
  ready_to_pickup: { label: 'Barang Siap Diambil di Kasir', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  completed:       { label: 'Selesai',                  color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200'   },
};

export default function MarketPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.success) setProducts(res.data);
      } catch (e) {
        console.error('Gagal memuat produk:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Derive categories
  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = activeCategory === 'Semua'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const updateCart = (product: Product, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (!existing && delta > 0) {
        return [...prev, { ...product, qty: 1 }];
      }
      return prev
        .map((c) => c.id === product.id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0);
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const getCartQty = (id: number) => cart.find((c) => c.id === id)?.qty ?? 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!user?.email) {
      alert('Silakan login terlebih dahulu!');
      navigate('/login');
      return;
    }

    setIsCheckingOut(true);
    try {
      // Minta nomor WA untuk struk digital Fonnte
      const userPhone = prompt('Masukkan nomor WhatsApp Anda untuk struk digital pengambilan di GOR (opsional):', '08');

      const res = await api.post('/orders', {
        customer_name:  user.name,
        customer_email: user.email,
        customer_phone: userPhone !== '08' ? userPhone : null,
        total_price:    cartTotal,
        items: cart.map((item) => ({
          id:       item.id,
          quantity: item.qty,
          price:    item.price,
        })),
      });

      if (res.success && res.snap_token) {
        // Buka Midtrans Snap popup
        (window as any).snap.pay(res.snap_token, {
          onSuccess: () => {
            setCart([]);
            setIsCartOpen(false);
            alert('✅ Pembayaran berhasil! Barangmu siap diambil di kasir GOR.');
          },
          onPending: () => {
            alert('⏳ Menunggu pembayaran. Cek riwayat pesananmu.');
            setIsCartOpen(false);
          },
          onError: () => {
            alert('❌ Pembayaran gagal. Silakan coba lagi.');
          },
          onClose: () => {
            console.log('Midtrans popup ditutup.');
          },
        });
      }
    } catch (e: any) {
      alert('Gagal membuat pesanan: ' + e.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2FA084] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#888888] font-bold">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] pb-32">
      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#2FA084]/30 text-white px-6 pt-10 pb-16">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2FA084] mb-2 block">
            Click &amp; Collect • Ambil di Kasir GOR
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            Toko &amp; Perlengkapan
          </h1>
          <p className="text-white/60 text-sm max-w-md">
            Pesan minuman dan perlengkapan sekarang, bayar online, dan ambil langsung di kasir GOR tanpa antre.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* CATEGORY PILLS */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#111111] text-white shadow-md'
                  : 'bg-white text-[#555555] border border-[#EEEEEE] hover:border-[#111111]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-[#EEEEEE] mx-auto mb-4" />
            <p className="text-[#888888] font-bold">Belum ada produk tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const qty = getCartQty(product.id);
              const outOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Product Image */}
                  <div className="relative h-36 bg-[#F8F8F8]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-[#DDDDDD]" />
                      </div>
                    )}
                    {product.is_rental && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Sewa
                      </span>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Stok Habis
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">
                      {product.category}
                    </span>
                    <p className="text-sm font-bold text-[#111111] leading-snug mb-1 flex-1">
                      {product.name}
                    </p>
                    <p className="text-[#2FA084] font-black text-base mb-3">
                      Rp {Number(product.price).toLocaleString('id-ID')}
                      {product.is_rental && (
                        <span className="text-xs font-normal text-[#888888]">/sesi</span>
                      )}
                    </p>

                    {/* Add to cart control */}
                    {qty === 0 ? (
                      <button
                        onClick={() => updateCart(product, 1)}
                        disabled={outOfStock}
                        className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${
                          outOfStock
                            ? 'bg-[#F0F0F0] text-[#AAAAAA] cursor-not-allowed'
                            : 'bg-[#111111] text-white hover:bg-[#2FA084]'
                        }`}
                      >
                        + Tambah
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-[#F0FDF8] rounded-xl px-3 py-1.5">
                        <button
                          onClick={() => updateCart(product, -1)}
                          className="w-6 h-6 rounded-full bg-[#2FA084] text-white flex items-center justify-center hover:bg-[#27896F] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-[#111111]">{qty}</span>
                        <button
                          onClick={() => updateCart(product, 1)}
                          disabled={qty >= product.stock}
                          className="w-6 h-6 rounded-full bg-[#2FA084] text-white flex items-center justify-center hover:bg-[#27896F] transition-colors disabled:bg-[#CCCCCC]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================= */}
      {/* FLOATING CART BUTTON */}
      {/* ======================================= */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-[#111111] text-white px-5 py-3.5 rounded-2xl shadow-2xl hover:bg-[#2FA084] transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#2FA084] text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <div className="text-left">
            <p className="text-xs text-white/70">Keranjang</p>
            <p className="font-black text-sm">Rp {cartTotal.toLocaleString('id-ID')}</p>
          </div>
        </button>
      )}

      {/* ======================================= */}
      {/* CART DRAWER */}
      {/* ======================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-[#EEEEEE] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#111111]">Keranjang</h2>
                <p className="text-xs text-[#888888]">Bayar &amp; ambil di kasir GOR</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full bg-[#F8F8F8] hover:bg-[#EEEEEE] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-xl border border-[#F0F0F0]">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#EEEEEE] flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-[#AAAAAA]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#111111] truncate">{item.name}</p>
                    <p className="text-xs text-[#2FA084] font-bold">
                      Rp {Number(item.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCart(item, -1)} className="w-6 h-6 rounded-full bg-[#EEEEEE] hover:bg-[#2FA084] hover:text-white text-[#111111] flex items-center justify-center transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-black w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateCart(item, 1)} className="w-6 h-6 rounded-full bg-[#EEEEEE] hover:bg-[#2FA084] hover:text-white text-[#111111] flex items-center justify-center transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center ml-1 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#EEEEEE] bg-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#888888]">Total</span>
                <span className="text-xl font-black text-[#111111]">
                  Rp {cartTotal.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-xs text-[#888888] mb-4">
                🏪 Barang akan siap diambil di kasir GOR setelah pembayaran.
              </p>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-4 bg-[#111111] hover:bg-[#2FA084] text-white font-black rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Bayar Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
