import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CreditCard, QrCode, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../services/api';
// Deklarasi fungsi snap agar TypeScript tidak protes karena objek window
declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{code: string, amount: number, type: string} | null>(null);

  const userStorage = localStorage.getItem('user');
  const userData = userStorage ? JSON.parse(userStorage) : { name: 'Tamu', email: 'Belum login' };
  
  const [customerPhone, setCustomerPhone] = useState(userData.phone || '');

  // 1. TARIK DATA BOOKING DARI LOCAL STORAGE (Bukan Dummy Lagi!)
  useEffect(() => {
    const pendingBooking = localStorage.getItem('pending_booking');
    if (pendingBooking) {
      const parsedData = JSON.parse(pendingBooking);
      setOrderData({
        venueName: parsedData.venue,
        courtName: parsedData.court,
        court_id: parsedData.court_id,
        date: parsedData.date, 
        timeSlots: parsedData.times,
        courtTotal: parsedData.courtTotal || parsedData.totalPrice,
        addonTotal: parsedData.addonTotal || 0,
        addons: parsedData.addons || [],
        subtotal: parsedData.totalPrice,
        adminFee: 2500, // Biaya admin tetap
        image: parsedData.image
      });
    } else {
      // Jika tidak ada data booking, lempar balik ke halaman booking
      alert('Tidak ada data pesanan. Silakan pilih lapangan terlebih dahulu.');
      navigate('/booking');
    }
  }, [navigate]);

  // Render loading sementara jika data belum masuk
  if (!orderData) return <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#2FA084]" /></div>;

  const totalPayment = orderData.courtTotal + orderData.addonTotal + orderData.adminFee - (discountInfo ? discountInfo.amount : 0);

  // 2. FUNGSI UNTUK MENEMBAK API LARAVEL LALU MEMBUKA MIDTRANS
  const handleCheckout = async () => {
    setIsProcessing(true);

    const payload = {
      court_id: orderData.court_id,
      customer_name: userData.name,
      customer_email: userData.email,
      customer_phone: customerPhone,
      booking_date: orderData.date.split('T')[0], 
      time_slots: orderData.timeSlots,
      subtotal: orderData.courtTotal, // Hanya total lapangan
      admin_fee: orderData.adminFee,
      total_price: orderData.courtTotal + orderData.adminFee, // Akan dihitung ulang di backend
      payment_method: selectedPayment,
      addons: orderData.addons || [],
      voucher_code: discountInfo?.code || undefined,
    };

    try {
      if (!customerPhone) {
        alert('Mohon isi Nomor WhatsApp Anda untuk pengiriman tiket!');
        setIsProcessing(false);
        return;
      }

      // a. Gunakan api.post agar Token otomatis terkirim!
      const result = await api.post('/bookings', payload);

      // b. Jika Laravel berhasil membuat tagihan dan mengembalikan snap_token
      if (result.success && result.snap_token) {
        
        // PANGGIL POPUP MIDTRANS
        window.snap.pay(result.snap_token, {
          onSuccess: function(result: any){
            console.log('Pembayaran Sukses:', result);
            alert('Pembayaran Berhasil! Tiket Anda telah diterbitkan.');
            localStorage.removeItem('pending_booking'); 
            navigate('/history'); 
          },
          onPending: function(result: any){
            console.log('Menunggu Pembayaran:', result);
            alert('Menunggu pembayaran Anda.');
            localStorage.removeItem('pending_booking');
            navigate('/history');
          },
          onError: function(result: any){
            console.error('Pembayaran Gagal:', result);
            alert('Pembayaran gagal, silakan coba lagi.');
            setIsProcessing(false);
          },
          onClose: function(){
            alert('Anda menutup popup sebelum menyelesaikan pembayaran.');
            setIsProcessing(false);
          }
        });

      } else {
        alert('Gagal mengambil tiket pembayaran dari server: ' + (result.message || 'Cek koneksi internet.'));
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error Gateway:', error);
      alert('Terjadi kesalahan: ' + (error.message || 'Server tidak merespons.'));
      setIsProcessing(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsApplyingVoucher(true);
    try {
      const eligibleSubtotal = orderData.courtTotal + orderData.addonTotal;
      const res = await api.post('/vouchers/validate', {
        code: voucherCode,
        subtotal: eligibleSubtotal
      });
      if (res.data.success && res.data.data) {
        setDiscountInfo({
          code: res.data.data.code,
          amount: res.data.data.discount,
          type: res.data.data.type
        });
        alert('Voucher berhasil digunakan!');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menggunakan voucher');
      setDiscountInfo(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setDiscountInfo(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 pb-24 font-sans animate-fade-in">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link to="/booking" className="inline-flex items-center gap-2 text-[#888888] hover:text-[#111111] transition-colors text-sm font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pemesanan
          </Link>
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Checkout Pembayaran</h1>
          <p className="text-[#888888] mt-1">Selesaikan pembayaranmu dengan aman dan cepat.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* KOLOM KIRI */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#EEEEEE] shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2FA084]" /> Informasi Pemesan
              </h2>
              <div className="bg-[#F8F8F8] p-4 rounded-xl border border-[#EEEEEE]">
                <p className="text-sm text-[#888888] mb-1">Nama Lengkap</p>
                <p className="font-bold text-[#111111]">{userData.name}</p> 
                <div className="w-full h-px bg-[#EEEEEE] my-3"></div>
                <p className="text-sm text-[#888888] mb-1">Email / Kontak</p>
                <p className="font-bold text-[#111111]">{userData.email}</p> 
                <div className="w-full h-px bg-[#EEEEEE] my-3"></div>
                <p className="text-sm text-[#888888] mb-1">Nomor WhatsApp (Untuk Tiket)</p>
                <input 
                  type="text" 
                  required
                  placeholder="0812xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 mt-1 bg-white border border-[#EEEEEE] rounded-lg text-[#111111] font-bold focus:outline-none focus:border-[#2FA084]"
                />
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#EEEEEE] shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] mb-6">Rincian Booking</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <img src={orderData.image} alt={orderData.venueName} className="w-full sm:w-[140px] h-[100px] object-cover rounded-xl border border-[#EEEEEE]" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#111111] mb-1">{orderData.venueName}</h3>
                  <p className="text-[#2FA084] font-semibold text-sm mb-4">{orderData.courtName}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#444444]">
                      <Calendar className="w-4 h-4 text-[#888888]" />
                      <span className="font-medium">
                        {new Date(orderData.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#444444]">
                      <Clock className="w-4 h-4 text-[#888888]" />
                      <span className="font-medium">
                        {orderData.timeSlots.join(', ')} ({orderData.timeSlots.length} Jam)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#EEEEEE] shadow-sm">
              <h2 className="text-lg font-bold text-[#111111] mb-4">Pilih Metode Pembayaran</h2>
              <div className="space-y-3">
                <button onClick={() => setSelectedPayment('qris')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedPayment === 'qris' ? 'border-[#2FA084] bg-[#F0FDF8] ring-1 ring-[#2FA084]' : 'border-[#EEEEEE] bg-white hover:border-[#CCCCCC]'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${selectedPayment === 'qris' ? 'bg-[#2FA084] text-white' : 'bg-[#F8F8F8] text-[#888888]'}`}><QrCode className="w-5 h-5" /></div>
                    <div className="text-left">
                      <p className="font-bold text-[#111111]">Bayar dengan Midtrans</p>
                      <p className="text-xs text-[#888888] mt-0.5">Mendukung QRIS, GoPay, ShopeePay, dan VA Bank.</p>
                    </div>
                  </div>
                  {selectedPayment === 'qris' && <CheckCircle2 className="w-6 h-6 text-[#2FA084]" />}
                </button>
              </div>
            </div>
            
          </div>

          {/* KOLOM KANAN */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#EEEEEE] shadow-lg sticky top-24">
              <h2 className="text-lg font-bold text-[#111111] mb-6">Ringkasan Pembayaran</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#888888]">Harga Sewa ({orderData.timeSlots.length} Jam)</span>
                  <span className="font-semibold text-[#444444]">Rp {orderData.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#888888]">Biaya Layanan</span>
                  <span className="font-semibold text-[#444444]">Rp {orderData.adminFee.toLocaleString('id-ID')}</span>
                </div>
                {discountInfo && (
                  <div className="flex justify-between items-center text-sm text-[#2FA084]">
                    <span className="font-bold">Diskon Voucher ({discountInfo.code})</span>
                    <span className="font-bold">- Rp {discountInfo.amount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
              
              {/* VOUCHER INPUT */}
              <div className="mb-6">
                <p className="text-sm font-bold text-[#111111] mb-2">Gunakan Voucher</p>
                {discountInfo ? (
                  <div className="flex items-center justify-between bg-[#F0FDF8] border border-[#2FA084] p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#2FA084]" />
                      <span className="font-bold text-[#2FA084]">{discountInfo.code}</span>
                    </div>
                    <button onClick={handleRemoveVoucher} className="text-xs text-red-500 font-bold hover:underline">Hapus</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Masukkan kode voucher" 
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="flex-1 p-3 bg-white border border-[#EEEEEE] rounded-xl text-sm font-bold focus:outline-none focus:border-[#2FA084] uppercase"
                    />
                    <button 
                      onClick={handleApplyVoucher}
                      disabled={isApplyingVoucher || !voucherCode.trim()}
                      className="bg-[#111111] hover:bg-[#2FA084] disabled:bg-[#CCCCCC] text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors"
                    >
                      {isApplyingVoucher ? 'Cek...' : 'Terapkan'}
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-dashed bg-[#CCCCCC] mb-6 border-b border-dashed border-[#CCCCCC]"></div>
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-base font-bold text-[#111111]">Total Tagihan</span>
                <span className="text-2xl font-extrabold text-[#2FA084]">Rp {totalPayment.toLocaleString('id-ID')}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-[#111111] hover:bg-[#2FA084] disabled:bg-[#CCCCCC] disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                  </>
                ) : (
                  'Bayar Sekarang'
                )}
              </button>
              
              <p className="text-center text-xs text-[#888888] mt-4 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Pembayaran dilindungi oleh Midtrans
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}