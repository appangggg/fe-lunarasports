import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '../../services/api';
import {
  BarChart3, Building2, Ticket, Users, Plus, Trash2, ShieldCheck,
  TrendingUp, X, Eye, EyeOff, CheckCircle, XCircle, AlertCircle,
  LogOut, ToggleLeft, ToggleRight, Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'overview' | 'venues' | 'vouchers' | 'users';

// ─────────────────────────────────────────────
// SUB-KOMPONEN: STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#EEEEEE] shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-[#888888] font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-[#111111] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showAdminPwd, setShowAdminPwd] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState<number | null>(null);
  const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);

  // Form states
  const [venueForm, setVenueForm] = useState({ name: '', kategori: 'Futsal', lokasi: '', phone: '', admin_name: '', admin_email: '', admin_password: '' });
  const [voucherForm, setVoucherForm] = useState({ code: '', discount_type: 'fixed', discount_value: '', min_transaction: '', max_discount: '' });

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, venuesRes, vouchersRes, usersRes] = await Promise.all([
        api.get('/superadmin/analytics'),
        api.get('/superadmin/venues'),
        api.get('/superadmin/vouchers'),
        api.get('/superadmin/users'),
      ]);
      setAnalytics(analyticsRes.data.data);
      setVenues(venuesRes.data.data);
      setVouchers(vouchersRes.data.data);
      setUsers(usersRes.data.data?.data || []);
    } catch (e: any) {
      if (e.response?.status === 403) {
        toast.error('Akses ditolak. Anda bukan Superadmin.');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVenueId) {
        await api.put(`/superadmin/venues/${editingVenueId}`, venueForm);
        toast.success(`GOR berhasil diperbarui!`);
      } else {
        await api.post('/superadmin/venues', venueForm);
        toast.success(`GOR "${venueForm.name}" berhasil dibuat!`);
      }
      setShowVenueModal(false);
      setEditingVenueId(null);
      setVenueForm({ name: '', kategori: 'Futsal', lokasi: '', phone: '', admin_name: '', admin_email: '', admin_password: '' });
      fetchAll();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan GOR');
    }
  };

  const handleDeleteVenue = async (id: number) => {
    if (!confirm('Hapus GOR ini beserta seluruh datanya?')) return;
    try {
      await api.delete(`/superadmin/venues/${id}`);
      toast.success('GOR berhasil dihapus');
      fetchAll();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Gagal menghapus GOR');
    }
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...voucherForm,
        discount_value: Number(voucherForm.discount_value),
        min_transaction: Number(voucherForm.min_transaction) || 0,
        max_discount: voucherForm.discount_type === 'percent' && voucherForm.max_discount ? Number(voucherForm.max_discount) : null,
      };

      if (editingVoucherId) {
        await api.put(`/superadmin/vouchers/${editingVoucherId}`, payload);
        toast.success('Voucher berhasil diperbarui!');
      } else {
        await api.post('/superadmin/vouchers', payload);
        toast.success('Voucher berhasil dibuat!');
      }
      setShowVoucherModal(false);
      setEditingVoucherId(null);
      setVoucherForm({ code: '', discount_type: 'fixed', discount_value: '', min_transaction: '', max_discount: '' });
      fetchAll();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Gagal'); }
  };

  const handleToggleVenue = async (id: number) => {
    await api.post(`/superadmin/venues/${id}/toggle-status`, {});
    fetchAll();
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!confirm('Hapus voucher ini?')) return;
    await api.delete(`/superadmin/vouchers/${id}`);
    fetchAll();
  };

  const handleToggleVoucher = async (id: number) => {
    await api.post(`/superadmin/vouchers/${id}/toggle`, {});
    fetchAll();
  };

  const handleEditVenue = (venue: any) => {
    setVenueForm({
      name: venue.name,
      kategori: venue.kategori,
      lokasi: venue.lokasi,
      phone: venue.phone || '',
      admin_name: '',
      admin_email: '',
      admin_password: ''
    });
    setEditingVenueId(venue.id);
    setShowVenueModal(true);
  };

  const handleEditVoucher = (voucher: any) => {
    setVoucherForm({
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_transaction: voucher.min_transaction || '',
      max_discount: voucher.max_discount || ''
    });
    setEditingVoucherId(voucher.id);
    setShowVoucherModal(true);
  };

  const handleToggleBan = async (id: number) => {
    await api.post(`/superadmin/users/${id}/toggle-ban`, {});
    fetchAll();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/welcome');
  };

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'venues', label: 'Manajemen GOR', icon: Building2 },
    { id: 'vouchers', label: 'Global Voucher', icon: Ticket },
    { id: 'users', label: 'Pengguna', icon: Users },
  ];

  if (isLoading) return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="text-center text-white">
        <ShieldCheck className="w-12 h-12 text-[#2FA084] mx-auto mb-3 animate-pulse" />
        <p className="font-bold">Memuat Panel Superadmin...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex font-sans">
      <Toaster position="top-right" />
      {/* ─── SIDEBAR ─── */}
      <aside className="w-64 bg-[#111111] flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[#2FA084]" />
            <span className="font-black text-white tracking-tight">LUNARA <span className="text-[#2FA084]">SUPER</span></span>
          </div>
          <p className="text-xs text-white/40">Platform Control Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id
                  ? 'bg-[#2FA084] text-white shadow-lg shadow-[#2FA084]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="ml-64 flex-1 p-8 overflow-auto">

        {/* ═══════════════ TAB 1: OVERVIEW ═══════════════ */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-extrabold text-[#111111] mb-2">Platform Overview</h1>
            <p className="text-[#888888] mb-8">Statistik global seluruh platform Lunara Sports.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Building2} label="GOR Aktif" value={analytics?.total_venues ?? 0} color="bg-[#2FA084]" />
              <StatCard icon={Users} label="Total Pengguna" value={analytics?.total_users ?? 0} color="bg-blue-500" />
              <StatCard icon={TrendingUp} label="Total Admin GOR" value={analytics?.total_admins ?? 0} color="bg-purple-500" />
              <StatCard icon={BarChart3} label="Gross Revenue" value={`Rp ${(analytics?.total_grv ?? 0).toLocaleString('id-ID')}`} color="bg-[#D4AF37]" />
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#EEEEEE] shadow-sm">
              <h2 className="font-extrabold text-[#111111] mb-4">Aktivitas Booking (7 Hari Terakhir)</h2>
              {analytics?.recent_bookings?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recent_bookings.map((b: any) => (
                    <div key={b.date} className="flex items-center justify-between py-2 border-b border-[#EEEEEE] last:border-0">
                      <span className="text-sm text-[#444444] font-medium">{b.date}</span>
                      <div className="flex gap-6">
                        <span className="text-sm font-bold text-[#2FA084]">{b.count} booking</span>
                        <span className="text-sm font-bold text-[#111111]">Rp {Number(b.revenue).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#888888] text-sm text-center py-8">Belum ada aktivitas booking dalam 7 hari terakhir.</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 2: VENUES ═══════════════ */}
        {activeTab === 'venues' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#111111]">Manajemen GOR</h1>
                <p className="text-[#888888]">Kelola seluruh venue terdaftar di platform.</p>
              </div>
              <button onClick={() => setShowVenueModal(true)} className="bg-[#2FA084] hover:bg-[#1F6F5F] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-5 h-5" /> Tambah GOR
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F8F8F8] border-b border-[#EEEEEE]">
                  <tr className="text-xs uppercase tracking-wider text-[#888888]">
                    <th className="p-4 font-bold">Nama GOR</th>
                    <th className="p-4 font-bold">Kategori</th>
                    <th className="p-4 font-bold">Lokasi</th>
                    <th className="p-4 font-bold">Owner / Admin</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map(v => (
                    <tr key={v.id} className="border-b border-[#EEEEEE] hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-4 font-bold text-[#111111]">{v.name}</td>
                      <td className="p-4 text-sm text-[#444444]">{v.kategori}</td>
                      <td className="p-4 text-sm text-[#444444]">{v.lokasi}</td>
                      <td className="p-4 text-sm text-[#444444]">{v.owner?.name ?? <span className="text-[#CCCCCC]">Belum ada</span>}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${v.status === 'active' ? 'bg-[#6FCF97]/20 text-[#1A7A50]' : 'bg-red-100 text-red-600'}`}>
                          {v.status === 'active' ? 'Aktif' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditVenue(v)} title="Edit GOR" className="p-2 text-[#888888] bg-[#F8F8F8] hover:bg-[#111111] hover:text-white rounded-lg transition-colors">
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleToggleVenue(v.id)} title="Toggle Status" className={`p-2 rounded-lg transition-colors ${v.status === 'active' ? 'text-orange-500 hover:bg-orange-50' : 'text-[#2FA084] hover:bg-[#F0FDF8]'}`}>
                            {v.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button onClick={() => handleDeleteVenue(v.id)} title="Hapus GOR" className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {venues.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-[#888888]">Belum ada GOR terdaftar.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 3: VOUCHERS ═══════════════ */}
        {activeTab === 'vouchers' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#111111]">Global Voucher</h1>
                <p className="text-[#888888]">Voucher promo berlaku untuk semua GOR di platform.</p>
              </div>
              <button onClick={() => setShowVoucherModal(true)} className="bg-[#2FA084] hover:bg-[#1F6F5F] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-5 h-5" /> Buat Voucher
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F8F8F8] border-b border-[#EEEEEE]">
                  <tr className="text-xs uppercase tracking-wider text-[#888888]">
                    <th className="p-4 font-bold">Kode</th>
                    <th className="p-4 font-bold">Diskon</th>
                    <th className="p-4 font-bold">Min. Transaksi</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map(v => (
                    <tr key={v.id} className="border-b border-[#EEEEEE] hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-4"><span className="font-mono font-bold bg-[#F0FDF8] text-[#2FA084] px-2 py-1 rounded border border-[#2FA084]">{v.code}</span></td>
                      <td className="p-4 text-sm font-bold">{v.discount_type === 'percent' ? `${v.discount_value}%` : `Rp ${Number(v.discount_value).toLocaleString('id-ID')}`}</td>
                      <td className="p-4 text-sm text-[#444444]">Rp {Number(v.min_transaction).toLocaleString('id-ID')}</td>
                      <td className="p-4">
                        <button onClick={() => handleToggleVoucher(v.id)} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${v.is_active ? 'bg-[#6FCF97]/20 text-[#1A7A50]' : 'bg-[#EEEEEE] text-[#888888]'}`}>
                          {v.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditVoucher(v)} title="Edit Voucher" className="p-2 text-[#888888] bg-[#F8F8F8] hover:bg-[#111111] hover:text-white rounded-lg transition-colors">
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteVoucher(v.id)} title="Hapus Voucher" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vouchers.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-[#888888]">Belum ada voucher.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 4: USERS ═══════════════ */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-[#111111]">Manajemen Pengguna</h1>
              <p className="text-[#888888]">Daftar seluruh pengguna terdaftar di platform.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F8F8F8] border-b border-[#EEEEEE]">
                  <tr className="text-xs uppercase tracking-wider text-[#888888]">
                    <th className="p-4 font-bold">Nama</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Terdaftar</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b border-[#EEEEEE] hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-4 font-bold text-[#111111] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2FA084] text-white flex items-center justify-center text-sm font-extrabold flex-shrink-0">{u.name?.charAt(0)}</div>
                        {u.name}
                      </td>
                      <td className="p-4 text-sm text-[#444444]">{u.email}</td>
                      <td className="p-4 text-sm text-[#888888]">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${u.role === 'banned' ? 'bg-red-100 text-red-600' : 'bg-[#6FCF97]/20 text-[#1A7A50]'}`}>
                          {u.role === 'banned' ? 'Banned' : 'Aktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleToggleBan(u.id)} className={`p-2 rounded-lg transition-colors text-sm font-bold ${u.role === 'banned' ? 'text-[#2FA084] hover:bg-[#F0FDF8]' : 'text-red-500 hover:bg-red-50'}`}>
                          {u.role === 'banned' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-[#888888]">Tidak ada pengguna.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════ MODAL TAMBAH GOR ═══════════════ */}
      {showVenueModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden">
            <div className="p-5 bg-[#111111] flex justify-between items-center">
              <h3 className="font-extrabold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-[#2FA084]" /> {editingVenueId ? 'Edit GOR' : 'Tambah GOR & Buat Admin'}</h3>
              <button onClick={() => { setShowVenueModal(false); setEditingVenueId(null); setVenueForm({ name: '', kategori: 'Futsal', lokasi: '', phone: '', admin_name: '', admin_email: '', admin_password: '' }); }} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveVenue} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <p className="text-xs font-bold text-[#888888] uppercase tracking-wider border-b pb-2">Info GOR</p>
              <div>
                <label className="block text-sm font-bold text-[#444444] mb-1">Nama GOR</label>
                <input required type="text" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]" placeholder="Gelora Futsal Arena" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#444444] mb-1">Kategori</label>
                  <select value={venueForm.kategori} onChange={e => setVenueForm({...venueForm, kategori: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]">
                    {['Futsal', 'Badminton', 'Mini Soccer', 'Basket', 'Tenis', 'Multi-Sport'].map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#444444] mb-1">No. Telepon</label>
                  <input type="text" value={venueForm.phone} onChange={e => setVenueForm({...venueForm, phone: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]" placeholder="0812..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#444444] mb-1">Alamat / Lokasi</label>
                <input required type="text" value={venueForm.lokasi} onChange={e => setVenueForm({...venueForm, lokasi: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]" placeholder="Jl. Contoh No. 1, Makassar" />
              </div>

              {!editingVenueId && (
                <>
                  <p className="text-xs font-bold text-[#888888] uppercase tracking-wider border-b pt-2 pb-2">Akun Admin GOR (Baru)</p>
                  <div>
                    <label className="block text-sm font-bold text-[#444444] mb-1">Nama Admin</label>
                    <input required type="text" value={venueForm.admin_name} onChange={e => setVenueForm({...venueForm, admin_name: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]" placeholder="Budi Santoso" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#444444] mb-1">Email Admin (Login)</label>
                    <input required type="email" value={venueForm.admin_email} onChange={e => setVenueForm({...venueForm, admin_email: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]" placeholder="admin@namagor.com" />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-[#444444] mb-1">Password Admin</label>
                    <input required type={showAdminPwd ? 'text' : 'password'} value={venueForm.admin_password} onChange={e => setVenueForm({...venueForm, admin_password: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] pr-12" placeholder="Min. 6 karakter" />
                    <button type="button" onClick={() => setShowAdminPwd(!showAdminPwd)} className="absolute right-3 top-10 text-[#888888]">
                      {showAdminPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowVenueModal(false); setEditingVenueId(null); setVenueForm({ name: '', kategori: 'Futsal', lokasi: '', phone: '', admin_name: '', admin_email: '', admin_password: '' }); }} className="flex-1 bg-[#F8F8F8] text-[#888888] font-bold py-3 rounded-xl hover:bg-[#EEEEEE] transition-colors">Batal</button>
                <button type="submit" className="flex-1 bg-[#2FA084] text-white font-bold py-3 rounded-xl hover:bg-[#1F6F5F] transition-colors">{editingVenueId ? 'Simpan Perubahan' : 'Buat GOR & Admin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL BUAT VOUCHER ═══════════════ */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden">
            <div className="p-5 bg-[#111111] flex justify-between items-center">
              <h3 className="font-extrabold text-white flex items-center gap-2"><Ticket className="w-5 h-5 text-[#2FA084]" /> {editingVoucherId ? 'Edit Voucher Promo' : 'Buat Voucher Promo'}</h3>
              <button onClick={() => { setShowVoucherModal(false); setEditingVoucherId(null); setVoucherForm({ code: '', discount_type: 'fixed', discount_value: '', min_transaction: '', max_discount: '' }); }} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveVoucher} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#444444] mb-1">Kode Voucher</label>
                <input required type="text" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value.toUpperCase()})} className="w-full p-3 border border-[#EEEEEE] rounded-xl font-mono uppercase focus:outline-none focus:border-[#2FA084]" placeholder="HARNAS2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#444444] mb-1">Tipe</label>
                  <select value={voucherForm.discount_type} onChange={e => setVoucherForm({...voucherForm, discount_type: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]">
                    <option value="fixed">Nominal (Rp)</option>
                    <option value="percent">Persentase (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#444444] mb-1">Nilai</label>
                  <input required type="number" min="1" value={voucherForm.discount_value} onChange={e => setVoucherForm({...voucherForm, discount_value: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]" />
                </div>
              </div>
              {voucherForm.discount_type === 'percent' && (
                <div>
                  <label className="block text-sm font-bold text-[#444444] mb-1">Maks. Potongan (Rp)</label>
                  <input type="number" value={voucherForm.max_discount} onChange={e => setVoucherForm({...voucherForm, max_discount: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]" />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-[#444444] mb-1">Min. Transaksi (Rp)</label>
                <input required type="number" min="0" value={voucherForm.min_transaction} onChange={e => setVoucherForm({...voucherForm, min_transaction: e.target.value})} className="w-full p-3 border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084]" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowVoucherModal(false); setEditingVoucherId(null); setVoucherForm({ code: '', discount_type: 'fixed', discount_value: '', min_transaction: '', max_discount: '' }); }} className="flex-1 bg-[#F8F8F8] text-[#888888] font-bold py-3 rounded-xl hover:bg-[#EEEEEE] transition-colors">Batal</button>
                <button type="submit" className="flex-1 bg-[#2FA084] text-white font-bold py-3 rounded-xl hover:bg-[#1F6F5F] transition-colors">{editingVoucherId ? 'Simpan Perubahan' : 'Buat Voucher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
