import { useState, useEffect } from 'react';
import { LayoutDashboard, ScanLine, Ticket, Wallet, Users, Bell, LogOut, CheckCircle2, Search, ArrowUpRight, TrendingUp, ChevronRight, X, ShoppingBag, Plus, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
 // Ubah baris ini:
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'scanner' | 'courts' | 'market'>('dashboard');
  // State untuk simulasi Scanner
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedData, setScannedData] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

// ... state sebelumnya ...
  const [revenueData, setRevenueData] = useState<any[]>([]);

  // ---> STATE UNTUK INFO VENUE ADMIN
  const [myVenue, setMyVenue] = useState<any>(null);

  // ---> STATE UNTUK MANAJEMEN LAPANGAN
  const [courts, setCourts] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCourt, setNewCourt] = useState({
    name: '',
    type: 'Futsal',
    harga: '',
    image: ''
  });

  // ----> STATE UNTUK MANAJEMEN PRODUK / MARKET
  const [products, setProducts] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Minuman',
    price: '',
    stock: '',
    image: '',
    is_rental: false,
  });

  // ----> STATE UNTUK EDIT LAPANGAN
  const [editingCourtId, setEditingCourtId] = useState<number | null>(null);

  // ----> STATE UNTUK JAM OPERASIONAL VENUE
  const [venueHours, setVenueHours] = useState({ open_time: '08:00', close_time: '23:00' });
  const [isSavingHours, setIsSavingHours] = useState(false);

  // ---> FUNGSI TARIK DATA LAPANGAN
  const fetchCourts = async () => {
    try {
      const response = await api.get('/admin/courts');
      if (response.success) {
        setCourts(response.data);
      }
    } catch (error) {
      console.error("Gagal menarik data lapangan", error);
    }
  };

  // Panggil saat menu 'courts' diklik
  useEffect(() => {
    if (activeMenu === 'courts') {
      fetchCourts();
    }
  }, [activeMenu]);

  // ---> FUNGSI TARIK DATA PRODUK
  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      if (response.success) setProducts(response.data);
    } catch (error) {
      console.error('Gagal menarik data produk:', error);
    }
  };

  useEffect(() => {
    if (activeMenu === 'market') {
      fetchProducts();
    }
  }, [activeMenu]);

  // ---> FUNGSI TAMBAH / EDIT PRODUK
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProductSubmitting(true);
    try {
      const payload = {
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        image: newProduct.image || undefined,
        is_rental: newProduct.is_rental,
      };

      let response;
      if (editingProductId) {
        response = await api.put(`/admin/products/${editingProductId}`, payload);
      } else {
        response = await api.post('/admin/products', payload);
      }

      if (response.success) {
        toast.success(`Produk berhasil ${editingProductId ? 'diperbarui' : 'ditambahkan'}!`);
        setIsProductModalOpen(false);
        setEditingProductId(null);
        setNewProduct({ name: '', category: 'Minuman', price: '', stock: '', image: '', is_rental: false });
        fetchProducts();
      } else {
        toast.error('Gagal: ' + response.message);
      }
    } catch {
      toast.error('Terjadi kesalahan sistem.');
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const openEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image || '',
      is_rental: product.is_rental,
    });
    setIsProductModalOpen(true);
  };

  // ---> FUNGSI HAPUS PRODUK
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus produk "${name}"?`)) return;
    try {
      const response = await api.delete(`/admin/products/${id}`);
      if (response.success) {
        toast.success('Produk dihapus.');
        fetchProducts();
      } else {
        toast.error('Gagal menghapus: ' + response.message);
      }
    } catch {
      toast.error('Terjadi kesalahan.');
    }
  };

  // ---> FUNGSI SIMPAN LAPANGAN (BARU/EDIT)
  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let response;
      if (editingCourtId) {
        response = await api.put(`/admin/courts/${editingCourtId}`, newCourt);
      } else {
        response = await api.post('/admin/courts', newCourt);
      }
      
      if (response.success) {
        toast.success(`Lapangan berhasil ${editingCourtId ? 'diperbarui' : 'ditambahkan'}!`);
        setIsAddModalOpen(false); // Tutup modal
        setEditingCourtId(null);
        setNewCourt({ name: '', type: 'Futsal', harga: '', image: '' }); // Reset form
        fetchCourts(); // Refresh data lapangan
      } else {
        toast.error("Gagal menyimpan: " + response.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditCourt = (court: any) => {
    setEditingCourtId(court.id);
    setNewCourt({
      name: court.name,
      type: court.type,
      harga: court.harga.toString(),
      image: court.image || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteCourt = async (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus lapangan "${name}"?`)) return;
    try {
      const response = await api.delete(`/admin/courts/${id}`);
      if (response.success) {
        toast.success('Lapangan dihapus.');
        fetchCourts();
      } else {
        toast.error('Gagal menghapus: ' + response.message);
      }
    } catch {
      toast.error('Terjadi kesalahan.');
    }
  };

useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoadingData(true);
      try {
        // Tarik data tabel booking
        const bookingRes = await api.get('/admin/bookings');
        if (bookingRes.success) setRecentBookings(bookingRes.data);

        // Tarik data grafik pendapatan
        const revenueRes = await api.get('/admin/weekly-revenue');
        if (revenueRes.success) setRevenueData(revenueRes.data);

        // Tarik data venue milik admin
        const venueRes = await api.get('/admin/my-venue');
        if (venueRes.success) setMyVenue(venueRes.data);

      } catch (error) {
        console.error('Gagal menarik data admin:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (activeMenu === 'dashboard') {
      fetchAdminData();
    }
  }, [activeMenu]);

  // Sync venueHours state ketika myVenue data berhasil di-fetch
  useEffect(() => {
    if (myVenue) {
      setVenueHours({
        open_time:  myVenue.open_time  ? myVenue.open_time.slice(0, 5)  : '08:00',
        close_time: myVenue.close_time ? myVenue.close_time.slice(0, 5) : '23:00',
      });
    }
  }, [myVenue]);

  // ----> HANDLER SIMPAN JAM OPERASIONAL
  const handleSaveVenueHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHours(true);
    try {
      const response = await api.patch('/admin/my-venue/hours', venueHours);
      if (response.success) {
        toast.success('Jam operasional berhasil disimpan!');
      } else {
        toast.error('Gagal menyimpan: ' + response.message);
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + (err.message || 'Server error'));
    } finally {
      setIsSavingHours(false);
    }
  };

  // Hitung statistik dari data yang sudah di-fetch
  const totalRevenuePeriod = revenueData.reduce((acc: number, d: any) => acc + Number(d.total_revenue), 0);
  const activeBookingsCount = recentBookings.filter((b: any) => b.status === 'paid' || b.status === 'pending').length;
  const completedCount = recentBookings.filter((b: any) => b.status === 'completed').length;

 // 1. FUNGSI SCAN TIKET (Menggantikan yang lama)
  const handleSimulateScan = async () => {
    // Meminta admin memasukkan kode (Karena kita belum pasang library kamera asli)
    const qrInput = window.prompt("Masukkan kode QR Tiket (Contoh: LNR-1-LUNARASPORTS):");
    
    if (!qrInput) return; // Batal kalau dikosongkan

    setScanStatus('scanning');
    
    try {
      const response = await api.post('/admin/verify-ticket', { qr_code: qrInput });
      
      if (response.success) {
        setScanStatus('success');
        setScannedData(response.data); // Masukkan data asli dari database
      } else {
        setScanStatus('error');
        toast.error(response.message);
      }
    } catch (error: any) {
      setScanStatus('error');
      toast.error("Error: Tiket tidak valid atau server bermasalah.");
    }
  };

  // 2. FUNGSI IZINKAN MASUK (Check-In)
  const handleCheckIn = async () => {
    try {
      const response = await api.post('/admin/checkin', { booking_id: scannedData.id });
      if (response.success) {
        toast.success("Berhasil! Pelanggan diizinkan masuk.");
        handleResetScan();
        // Kalau mau, panggil fetchAdminBookings() lagi di sini agar tabel ikut ter-update
      }
    } catch (error) {
      toast.error("Gagal melakukan Check-in.");
    }
  };
  const handleResetScan = () => {
    setScanStatus('idle');
    setScannedData(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] font-sans flex overflow-hidden">
      <Toaster position="top-right" />
      {/* ========================================= */}
      {/* SIDEBAR NAVIGATION (Dark Mode Premium) */}
      {/* ========================================= */}
      <aside className="w-64 bg-[#0A0A0A] text-white hidden md:flex flex-col h-screen shrink-0 relative z-20 shadow-2xl">
        <div className="p-6 lg:p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2FA084] to-[#1F6F5F] rounded-xl flex items-center justify-center font-black text-2xl italic tracking-tighter shadow-[0_0_15px_rgba(47,160,132,0.4)]">
            L
          </div>
          <span className="font-extrabold text-xl tracking-wide">
            LUNARA<span className="text-[#2FA084]">ADMIN</span>
          </span>
        </div>

        <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto hide-scrollbar">
          <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-3 px-4">Menu Utama</p>
          
          <button 
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeMenu === 'dashboard' ? 'bg-[#2FA084] text-white shadow-[0_4px_20px_rgba(47,160,132,0.3)] translate-x-1' : 'text-[#888888] hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Ringkasan
          </button>
          
          <button 
            onClick={() => setActiveMenu('scanner')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeMenu === 'scanner' ? 'bg-[#2FA084] text-white shadow-[0_4px_20px_rgba(47,160,132,0.3)] translate-x-1' : 'text-[#888888] hover:bg-white/5 hover:text-white'}`}
          >
            <ScanLine className="w-5 h-5" /> Scan Tiket QR
          </button>

          <button 
            onClick={() => setActiveMenu('courts')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeMenu === 'courts' ? 'bg-[#2FA084] text-white shadow-[0_4px_20px_rgba(47,160,132,0.3)] translate-x-1' : 'text-[#888888] hover:bg-white/5 hover:text-white group'}`}
          >
            <Ticket className={`w-5 h-5 ${activeMenu !== 'courts' && 'group-hover:rotate-12 transition-transform'}`} /> Manajemen Venue
          </button>

          <button 
            onClick={() => setActiveMenu('market')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeMenu === 'market' ? 'bg-[#2FA084] text-white shadow-[0_4px_20px_rgba(47,160,132,0.3)] translate-x-1' : 'text-[#888888] hover:bg-white/5 hover:text-white'}`}
          >
            <ShoppingBag className="w-5 h-5" /> Toko & Market
          </button>
        </div>

        <div className="p-6">
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <LogOut className="w-4 h-4" /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ========================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        {/* HEADER TOPBAR */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#EEEEEE] p-5 sm:px-8 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-[#111111] capitalize tracking-tight">
              {activeMenu === 'dashboard' ? `Dashboard ${myVenue ? myVenue.name : 'Utama'}` : 
               activeMenu === 'scanner' ? 'Verifikasi Tiket' : 
               activeMenu === 'courts' ? 'Manajemen Lapangan' : 'Manajemen Toko'}
            </h2>
            <p className="text-sm text-[#888888] font-medium mt-0.5">
              {myVenue ? `Kelola operasional ${myVenue.name} dengan mudah.` : 'Kelola operasional venue dengan mudah.'}
            </p>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2.5 text-[#888888] bg-[#F8F8F8] hover:bg-[#EEEEEE] rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-[#EEEEEE] hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-extrabold text-[#111111] group-hover:text-[#2FA084] transition-colors">
                  {myVenue ? `Admin ${myVenue.name}` : 'Superadmin'}
                </p>
                <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                  {myVenue ? myVenue.name : 'Administrator'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#111111] to-[#333333] text-white flex items-center justify-center font-bold border-2 border-white shadow-md">
                A
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="p-5 sm:p-8">
          
          {/* --- TAB DASHBOARD --- */}
          {activeMenu === 'dashboard' && (
            <div className="animate-fade-in space-y-8">
              
              {/* Statistik Kartu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Kartu Pendapatan (Highlight Mewah) */}
                <div className="bg-gradient-to-br from-[#111111] to-[#2FA084] p-6 rounded-3xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center"><Wallet className="w-6 h-6" /></div>
                    <span className="flex items-center text-xs font-bold text-[#111111] bg-[#F2C94C] px-3 py-1.5 rounded-lg shadow-sm"><TrendingUp className="w-3.5 h-3.5 mr-1"/> +12%</span>
                  </div>
                  <div className="mt-6 relative z-10">
                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Pendapatan 7 Hari</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      Rp {totalRevenuePeriod.toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>

                {/* Kartu Booking Aktif */}
                <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm flex flex-col justify-between hover:border-[#2FA084]/30 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2FA084] flex items-center justify-center"><Ticket className="w-6 h-6" /></div>
                  <div className="mt-6">
                    <p className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-1">Total Booking Aktif</p>
                    <h3 className="text-3xl font-black text-[#111111] tracking-tight">{activeBookingsCount} <span className="text-sm font-bold text-[#888888]">Jadwal</span></h3>
                  </div>
                </div>

                {/* Kartu Pengunjung */}
                <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm flex flex-col justify-between hover:border-[#F2994A]/30 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] text-[#F2C94C] flex items-center justify-center"><Users className="w-6 h-6" /></div>
                  <div className="mt-6">
                    <p className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-1">Pengunjung Hadir</p>
                    <h3 className="text-3xl font-black text-[#111111] tracking-tight">{completedCount} <span className="text-sm font-bold text-[#888888]">Orang</span></h3>
                  </div>
                </div>
              </div>
{/* --- GRAFIK PENDAPATAN MINGGUAN --- */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EEEEEE] shadow-sm">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#111111]">Grafik Pendapatan</h3>
                    <p className="text-sm text-[#888888] font-medium mt-1">Total pemasukan 7 hari terakhir.</p>
                  </div>
                  <div className="bg-[#E8F5E9] text-[#2FA084] px-4 py-2 rounded-xl text-xs font-bold border border-[#2FA084]/20 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> 7 Hari Terakhir
                  </div>
                </div>

                {/* Area Bar Chart Custom Tailwind */}
                <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 mt-4">
                  {revenueData.length > 0 ? (
                    revenueData.map((item, index) => {
                      // Cari nilai tertinggi untuk mengukur tinggi bar secara otomatis
                      const maxRevenue = Math.max(...revenueData.map((d) => d.total_revenue));
                      // Hitung persentase tinggi bar (minimal 10% agar tetap terlihat)
                      const barHeight = Math.max((item.total_revenue / maxRevenue) * 100, 10);
                      
                      // Format tanggal (misal: "2026-06-06" jadi "06 Jun")
                      const dateObj = new Date(item.date);
                      const displayDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

                      return (
                        <div key={index} className="flex flex-col items-center flex-1 group">
                          {/* Tooltip Hover Harga */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-[#111111] text-white text-[10px] sm:text-xs font-bold py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                            Rp {Number(item.total_revenue).toLocaleString('id-ID')}
                          </div>
                          
                          {/* Batang Grafik */}
                          <div className="w-full relative flex justify-center items-end h-full">
                            <div 
                              className="w-full max-w-[40px] bg-gradient-to-t from-[#1F6F5F] to-[#2FA084] rounded-t-xl transition-all duration-700 ease-out group-hover:shadow-[0_0_15px_rgba(47,160,132,0.4)]"
                              style={{ height: `${barHeight}%` }}
                            ></div>
                          </div>
                          
                          {/* Label Tanggal Bawah */}
                          <span className="text-[10px] sm:text-xs font-bold text-[#888888] mt-3 whitespace-nowrap">
                            {displayDate}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#888888] text-sm font-medium">
                      Belum ada data pendapatan minggu ini.
                    </div>
                  )}
                </div>
              </div>
              {/* Tabel Transaksi Terbaru */}
              <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-[#EEEEEE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#111111]">Booking Terbaru</h3>
                    <p className="text-sm text-[#888888] font-medium">Daftar transaksi yang masuk hari ini.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Cari Order ID..." className="w-full pl-11 pr-4 py-2.5 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 transition-all" />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8F8F8] text-[#888888] font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-8 py-5">Order ID</th>
                        <th className="px-8 py-5">Pelanggan</th>
                        <th className="px-8 py-5">Area & Waktu</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-[#EEEEEE]">
                      {isLoadingData ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-10 text-center text-[#888888] font-bold">
                            Memuat data pesanan...
                          </td>
                        </tr>
                      ) : recentBookings.length > 0 ? (
                        recentBookings.map((booking: any) => (
                          <tr key={booking.id} className="hover:bg-[#F8F8F8]/50 transition-colors group">
                            <td className="px-8 py-5 font-mono font-bold text-[#111111]">
                              LNR-{booking.id}
                            </td>
                            <td className="px-8 py-5 font-bold text-[#111111]">
                              {booking.customer_name}
                            </td>
                            <td className="px-8 py-5">
                              <p className="font-bold text-[#444444] text-sm">{booking.court?.name || 'Lapangan'}</p>
                              <p className="text-xs text-[#888888] font-medium mt-0.5">
                                {Array.isArray(booking.time_slots) ? booking.time_slots.join(', ') : booking.time_slots}
                              </p>
                            </td>
                            <td className="px-8 py-5">
                              {booking.status === 'paid' && <span className="bg-[#E8F5E9] text-[#2FA084] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#2FA084]/20">Sukses</span>}
                              {booking.status === 'pending' && <span className="bg-[#FFF9E6] text-[#F2994A] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#F2994A]/20">Menunggu</span>}
                              {booking.status === 'cancelled' && <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200">Dibatalkan</span>}
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button className="text-[#2FA084] font-bold text-sm hover:underline">Detail</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-8 py-10 text-center text-[#888888] font-bold">
                            Belum ada pesanan masuk hari ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB SCANNER --- */}
          {activeMenu === 'scanner' && (
            <div className="animate-fade-in flex flex-col lg:flex-row gap-8">
              
              {/* Area Kamera Scanner */}
              <div className="w-full lg:w-1/2">
                <div className="bg-[#0A0A0A] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-2xl border-4 border-[#111111]">
                  
                  {scanStatus === 'idle' && (
                    <div className="text-center z-10 relative">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ScanLine className="w-10 h-10 text-white/50" />
                      </div>
                      <h3 className="text-white font-bold text-xl mb-2">Sistem Pemindai Tiket</h3>
                      <p className="text-white/50 text-sm font-medium mb-8 max-w-xs mx-auto">Arahkan kamera ke QR Code pada tiket pengunjung untuk melakukan verifikasi.</p>
                      <button 
                        onClick={handleSimulateScan}
                        className="bg-[#2FA084] text-white px-8 py-4 rounded-xl font-extrabold shadow-[0_4px_20px_rgba(47,160,132,0.4)] hover:bg-[#1F6F5F] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                      >
                        Mulai Simulasi Scan
                      </button>
                    </div>
                  )}

                  {scanStatus === 'scanning' && (
                    <div className="relative z-10">
                      <div className="w-72 h-72 relative">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#2FA084] rounded-tl-2xl"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#2FA084] rounded-tr-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#2FA084] rounded-bl-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#2FA084] rounded-br-2xl"></div>
                        
                        {/* Garis Scan Animasi Halus */}
                        <div className="w-full h-1.5 bg-[#2FA084] absolute top-0 rounded-full animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_20px_#2FA084]"></div>
                      </div>
                      <p className="text-[#2FA084] text-center mt-8 font-bold tracking-widest uppercase animate-pulse">Memindai...</p>
                    </div>
                  )}

                  {scanStatus === 'success' && (
                    <div className="text-center animate-bounce-in z-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.5)]">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tight mb-2">Tiket Valid!</h3>
                      <p className="text-white/60 font-medium">Verifikasi berhasil dilakukan.</p>
                    </div>
                  )}

                  <style>{`
                    @keyframes scan {
                      0% { top: 0; opacity: 0; }
                      10% { opacity: 1; }
                      90% { opacity: 1; }
                      100% { top: 100%; opacity: 0; }
                    }
                    @keyframes bounce-in {
                      0% { transform: scale(0.5); opacity: 0; }
                      60% { transform: scale(1.1); opacity: 1; }
                      100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                  `}</style>
                </div>
              </div>

              {/* Area Hasil Scan */}
              <div className="w-full lg:w-1/2">
                <div className="bg-white rounded-3xl p-8 border border-[#EEEEEE] shadow-sm h-full flex flex-col">
                  
                  {!scannedData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-[#F8F8F8] rounded-full flex items-center justify-center mb-6">
                        <ScanLine className="w-8 h-8 text-[#CCCCCC]" />
                      </div>
                      <h3 className="text-xl font-extrabold text-[#111111] mb-2">Data Belum Tersedia</h3>
                      <p className="text-[#888888] text-sm max-w-xs mx-auto">Informasi pelanggan akan otomatis muncul di sini setelah tiket berhasil dipindai.</p>
                    </div>
                  ) : (
                    <div className="animate-fade-in flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#EEEEEE]">
                          <h3 className="text-xl font-extrabold text-[#111111]">Detail Pengunjung</h3>
                          <span className="bg-[#E8F5E9] text-[#2FA084] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#2FA084]/20 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                          </span>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Order ID</p>
                            <p className="font-mono font-black text-2xl text-[#111111]">{scannedData.id}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Nama Pemesan</p>
                            <p className="font-bold text-[#111111] text-lg bg-[#F8F8F8] px-4 py-3 rounded-xl border border-[#EEEEEE]">{scannedData.name}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Area Lapangan</p>
                              <p className="font-bold text-[#111111] text-sm bg-[#F8F8F8] px-4 py-3 rounded-xl border border-[#EEEEEE]">{scannedData.venue.split(' - ')[1]}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Waktu Main</p>
                              <p className="font-bold text-[#111111] text-sm bg-[#F8F8F8] px-4 py-3 rounded-xl border border-[#EEEEEE]">{scannedData.time.split(' ')[0]} - {scannedData.time.split(' ')[2]}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-[#EEEEEE] flex gap-4">
                      <button 
        onClick={handleCheckIn}
        className="flex-1 bg-[#111111] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#2FA084] transform hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
      >
        Izinkan Masuk <ChevronRight className="w-4 h-4" />
      </button>
                        <button 
                          onClick={handleResetScan}
                          className="px-6 sm:px-8 bg-white text-[#111111] py-4 rounded-xl font-bold border-2 border-[#EEEEEE] hover:border-[#111111] hover:bg-[#F8F8F8] transition-all duration-300"
                        >
                          Scan Lagi
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* --- TAB MARKET / TOKO --- */}
          {activeMenu === 'market' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#111111]">Toko & Market</h3>
                  <p className="text-[#888888] text-sm mt-1">Kelola stok dan harga produk yang dijual di venue.</p>
                </div>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex items-center gap-2 bg-[#111111] text-white px-5 py-3 rounded-xl font-bold shadow-md hover:bg-[#2FA084] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Barang
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8F8F8] text-[#888888] font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-5">Foto</th>
                        <th className="px-6 py-5">Nama Produk</th>
                        <th className="px-6 py-5">Kategori</th>
                        <th className="px-6 py-5">Harga</th>
                        <th className="px-6 py-5">Stok</th>
                        <th className="px-6 py-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEEEE]">
                      {products.length > 0 ? (
                        products.map((product: any) => (
                          <tr key={product.id} className="hover:bg-[#F8F8F8]/50 transition-colors">
                            <td className="px-6 py-4">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-[#EEEEEE]" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-[#F0FDF8] border border-[#2FA084]/20 flex items-center justify-center">
                                  <ShoppingBag className="w-5 h-5 text-[#2FA084]" />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-bold text-[#111111]">{product.name}</td>
                            <td className="px-6 py-4">
                              <span className="bg-[#F8F8F8] text-[#555555] px-3 py-1 rounded-lg text-xs font-bold border border-[#EEEEEE]">{product.category}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#2FA084]">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                                product.stock === 0
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : product.stock < 5
                                  ? 'bg-[#FFF9E6] text-[#F2994A] border-[#F2994A]/20'
                                  : 'bg-[#E8F5E9] text-[#2FA084] border-[#2FA084]/20'
                              }`}>{product.stock} pcs</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditProduct(product)}
                                  className="p-2 text-[#888888] bg-[#F8F8F8] hover:bg-[#111111] hover:text-white rounded-xl transition-all duration-200 border border-[#EEEEEE]"
                                  title="Edit Produk"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  className="p-2 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 border border-red-100"
                                  title="Hapus Produk"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <ShoppingBag className="w-10 h-10 text-[#CCCCCC]" />
                              <p className="font-bold text-[#888888]">Belum ada produk di toko.</p>
                              <p className="text-sm text-[#AAAAAA]">Klik tombol "Tambah Barang" untuk mulai berjualan.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB MANAJEMEN VENUE (COURTS) --- */}
          {activeMenu === 'courts' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#111111]">Daftar Lapangan</h3>
                  <p className="text-[#888888] text-sm mt-1">Kelola harga dan ketersediaan lapangan GOR Anda.</p>
                </div>
                {/* Tombol buka Modal */}
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#111111] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#2FA084] transition-colors"
                >
                  + Tambah Lapangan
                </button>
              </div>

              {/* ==========================================
                  KARTU PENGATURAN JAM OPERASIONAL VENUE
                  ========================================== */}
              <form onSubmit={handleSaveVenueHours} className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm p-6 mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#2FA084]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#111111]">Jam Operasional Venue</h4>
                    <p className="text-xs text-[#888888]">Slot booking akan digenerate otomatis sesuai jam ini.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">🌅 Jam Buka</label>
                    <input
                      type="time"
                      value={venueHours.open_time}
                      onChange={(e) => setVenueHours({ ...venueHours, open_time: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">🌙 Jam Tutup</label>
                    <input
                      type="time"
                      value={venueHours.close_time}
                      onChange={(e) => setVenueHours({ ...venueHours, close_time: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSavingHours}
                  className="w-full bg-[#111111] text-white font-bold py-3 rounded-xl hover:bg-[#2FA084] transition-all disabled:opacity-50 text-sm"
                >
                  {isSavingHours ? 'Menyimpan...' : 'Simpan Jam Operasional'}
                </button>
              </form>

              {/* Grid Card Lapangan Dinamis */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courts.length > 0 ? (
                  courts.map((court) => (
                    <div key={court.id} className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden shadow-sm group">
                      <div className="h-48 overflow-hidden relative bg-[#F8F8F8]">
                        <img 
                          src={court.image || 'https://placehold.co/600x400/EEEEEE/AAAAAA?text=Venue'} 
                          alt={court.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#111111] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                          {court.type || 'Olahraga'}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-extrabold text-[#111111] line-clamp-1">{court.name}</h4>
                            <p className="text-[#2FA084] font-black mt-1">Rp {Number(court.harga).toLocaleString('id-ID')} <span className="text-xs text-[#888888] font-medium">/ jam</span></p>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-[#EEEEEE]">
                          <button 
                            onClick={() => openEditCourt(court)}
                            className="flex-1 bg-[#F8F8F8] text-[#111111] py-2.5 rounded-xl text-sm font-bold border border-[#EEEEEE] hover:border-[#111111] transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCourt(court.id, court.name)}
                            className="px-4 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-[#888888] bg-white border border-dashed border-[#CCCCCC] rounded-3xl">
                    <p className="font-bold text-lg mb-1">Belum ada data lapangan.</p>
                    <p className="text-sm">Klik tombol + Tambah Lapangan untuk memulai.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ========================================= */}
      {/* MODAL TAMBAH LAPANGAN BARU */}
      {/* ========================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-md rounded-3xl relative z-10 shadow-2xl animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-[#EEEEEE] flex justify-between items-center">
              <h3 className="font-extrabold text-xl text-[#111111]">
                {editingCourtId ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCourtId(null);
                  setNewCourt({ name: '', type: 'Futsal', harga: '', image: '' });
                }} 
                className="p-2 bg-[#F8F8F8] text-[#888888] hover:text-[#111111] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCourt} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">Nama Lapangan</label>
                <input 
                  type="text" required
                  value={newCourt.name}
                  onChange={(e) => setNewCourt({...newCourt, name: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold"
                  placeholder="Contoh: Lapangan A (Vinyl)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">Kategori</label>
                  <select 
                    value={newCourt.type}
                    onChange={(e) => setNewCourt({...newCourt, type: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="Futsal">Futsal</option>
                    <option value="Mini Soccer">Mini Soccer</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Basket">Basket</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">Harga / Jam</label>
                  <input 
                    type="number" required
                    value={newCourt.harga}
                    onChange={(e) => setNewCourt({...newCourt, harga: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold"
                    placeholder="Contoh: 150000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">URL Foto (Opsional)</label>
                <input 
                  type="url"
                  value={newCourt.image}
                  onChange={(e) => setNewCourt({...newCourt, image: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-4 mt-6 border-t border-[#EEEEEE]">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#111111] text-white font-bold py-3.5 rounded-xl hover:bg-[#2FA084] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : (editingCourtId ? 'Simpan Perubahan' : 'Simpan Lapangan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
        
      </main>

      {/* ========================================= */}
      {/* MODAL TAMBAH PRODUK BARU */}
      {/* ========================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-md rounded-3xl relative z-10 shadow-2xl animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-[#EEEEEE] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDF8] text-[#2FA084] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-xl text-[#111111]">
                  {editingProductId ? 'Edit Barang' : 'Tambah Barang Baru'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProductId(null);
                  setNewProduct({ name: '', category: 'Minuman', price: '', stock: '', image: '', is_rental: false });
                }} 
                className="p-2 bg-[#F8F8F8] text-[#888888] hover:text-[#111111] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">Nama Produk</label>
                <input
                  type="text" required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold"
                  placeholder="Contoh: Air Mineral Aqua 600ml"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">Kategori</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value="Minuman">Minuman</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Perlengkapan">Perlengkapan</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">Harga (Rp)</label>
                  <input
                    type="number" required min="0"
                    value={newProduct.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewProduct({...newProduct, price: val === '' ? '' : Math.abs(Number(val)).toString()});
                    }}
                    className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">Stok (pcs)</label>
                  <input
                    type="number" required min="0"
                    value={newProduct.stock}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewProduct({...newProduct, stock: val === '' ? '' : Math.abs(Number(val)).toString()});
                    }}
                    className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm font-bold"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2">URL Foto (Opsional)</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:border-[#2FA084] outline-none text-sm"
                  placeholder="https://..."
                />
              </div>

              {/* TOGGLE IS_RENTAL */}
              <div
                onClick={() => setNewProduct({...newProduct, is_rental: !newProduct.is_rental})}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  newProduct.is_rental
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-[#EEEEEE] bg-[#F8F8F8] hover:border-[#CCCCCC]'
                }`}
              >
                <div>
                  <p className={`text-sm font-extrabold ${newProduct.is_rental ? 'text-amber-700' : 'text-[#111111]'}`}>
                    Barang Sewaan 🏸
                  </p>
                  <p className="text-xs text-[#888888] mt-0.5">
                    {newProduct.is_rental
                      ? 'Aktif — harga ditampilkan sebagai harga sewa/sesi'
                      : 'Nonaktif — barang dijual, stok berkurang'}
                  </p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 ${
                  newProduct.is_rental ? 'bg-amber-400 justify-end' : 'bg-[#DDDDDD] justify-start'
                }`}>
                  <div className="w-5 h-5 bg-white rounded-full shadow-md transition-all" />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-[#EEEEEE]">
                <button
                  type="submit"
                  disabled={isProductSubmitting}
                  className="w-full bg-[#111111] text-white font-bold py-3.5 rounded-xl hover:bg-[#2FA084] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProductSubmitting ? 'Menyimpan...' : (editingProductId ? 'Simpan Perubahan' : <><Plus className="w-4 h-4" /> Simpan Produk</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}