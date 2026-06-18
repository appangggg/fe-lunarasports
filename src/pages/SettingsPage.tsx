import { useState, useEffect } from 'react';
import { User, Shield, Bell, CreditCard, Check } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [profileForm, setProfileForm] = useState({ name: '', email: '', customer_phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.success) {
          setProfileForm({
            name: res.data.name || '',
            email: res.data.email || '',
            customer_phone: res.data.customer_phone || ''
          });
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (err) {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
          try {
            const user = JSON.parse(storedUser);
            setProfileForm({ name: user.name, email: user.email, customer_phone: user.customer_phone || '' });
          } catch (e) {
            console.error('Failed to parse user from local storage', e);
          }
        }
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/user/profile', profileForm);
      if (res.success) {
        setToastMessage('Profil berhasil diperbarui!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Gagal menyimpan profil.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleSavePassword = async () => {
    try {
      const res = await api.put('/user/password', passwordForm);
      if (res.success) {
        setToastMessage('Kata sandi berhasil diubah!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Gagal mengubah kata sandi.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-28 pb-20 font-sans relative">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight mb-8">
          Pengaturan <span className="text-[#2FA084]">Akun</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* ========================================= */}
          {/* SIDEBAR KIRI */}
          {/* ========================================= */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-4 border border-[#EEEEEE] shadow-sm flex flex-col gap-2">
              <button onClick={() => setActiveTab('account')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'account' ? 'bg-[#2FA084] text-white shadow-md' : 'text-[#888888] hover:bg-[#F8F8F8] hover:text-[#111111]'}`}>
                <User className="w-5 h-5" /> Akun Profil
              </button>
              <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-[#2FA084] text-white shadow-md' : 'text-[#888888] hover:bg-[#F8F8F8] hover:text-[#111111]'}`}>
                <Shield className="w-5 h-5" /> Keamanan
              </button>
              <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-[#2FA084] text-white shadow-md' : 'text-[#888888] hover:bg-[#F8F8F8] hover:text-[#111111]'}`}>
                <Bell className="w-5 h-5" /> Notifikasi
              </button>
              <button onClick={() => setActiveTab('payment')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'payment' ? 'bg-[#2FA084] text-white shadow-md' : 'text-[#888888] hover:bg-[#F8F8F8] hover:text-[#111111]'}`}>
                <CreditCard className="w-5 h-5" /> Pembayaran
              </button>
            </div>
          </div>

          {/* ========================================= */}
          {/* KONTEN KANAN */}
          {/* ========================================= */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#EEEEEE] shadow-sm min-h-[500px]">
              <h2 className="text-xl font-bold text-[#111111] mb-6">
                {activeTab === 'account' && 'Informasi Pribadi'}
                {activeTab === 'security' && 'Keamanan Akun'}
                {activeTab === 'notifications' && 'Preferensi Notifikasi'}
                {activeTab === 'payment' && 'Metode Pembayaran'}
              </h2>

              {/* --- TAB 1: AKUN PROFIL --- */}
              {activeTab === 'account' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#EEEEEE]">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || 'User')}&background=2FA084&color=fff&size=128&rounded=true&bold=true`} alt="Profile" className="w-20 h-20 rounded-full border-4 border-[#F8F8F8] shadow-sm"/>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-4 py-2 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-bold text-[#111111] hover:bg-white hover:border-[#2FA084] transition-all">Ubah Foto</button>
                      <button className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">Hapus</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Nama Lengkap</label>
                      <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Alamat Email</label>
                      <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Nomor Handphone</label>
                      <input type="tel" value={profileForm.customer_phone} onChange={(e) => setProfileForm({...profileForm, customer_phone: e.target.value})} placeholder="Contoh: 081234567890" className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-[#EEEEEE]">
                    <button className="px-6 py-2.5 bg-transparent text-[#888888] font-bold rounded-xl hover:bg-[#F8F8F8] hover:text-[#111111] transition-colors">Batal</button>
                    <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-[#2FA084] text-white font-bold rounded-xl hover:bg-[#1F6F5F] shadow-[0_4px_14px_0_rgba(47,160,132,0.39)] transition-all transform hover:-translate-y-0.5">
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              )}

              {/* --- TAB 2: KEAMANAN --- */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-5 pb-6 border-b border-[#EEEEEE]">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Kata Sandi Saat Ini</label>
                      <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Kata Sandi Baru</label>
                      <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} placeholder="Minimal 8 karakter" className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Konfirmasi Kata Sandi Baru</label>
                      <input type="password" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})} placeholder="Ulangi kata sandi baru" className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-bold text-[#111111]">Autentikasi Dua Langkah (2FA)</h4>
                      <p className="text-sm text-[#888888] mt-0.5">Tambahkan lapis keamanan ekstra saat login.</p>
                    </div>
                    <button className="w-12 h-6 bg-[#CCCCCC] rounded-full relative transition-colors duration-300 focus:outline-none hover:bg-[#888888]">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] shadow-sm transition-transform duration-300"></div>
                    </button>
                  </div>
                  <div className="flex justify-end pt-6 border-t border-[#EEEEEE]">
                    <button onClick={handleSavePassword} className="px-6 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-[#2FA084] shadow-md transition-all transform hover:-translate-y-0.5">Perbarui Keamanan</button>
                  </div>
                </div>
              )}

              {/* --- TAB 3: NOTIFIKASI --- */}
              {activeTab === 'notifications' && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="pr-4">
                      <h4 className="font-bold text-[#111111]">Pengingat Jadwal (WhatsApp)</h4>
                      <p className="text-sm text-[#888888] mt-0.5">Kirim pengingat otomatis dan QR Tiket ke WhatsApp 1 jam sebelum jadwal bermain.</p>
                    </div>
                    <button className="w-12 h-6 bg-[#2FA084] rounded-full flex-shrink-0 relative transition-colors duration-300 focus:outline-none shadow-inner">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] right-[2px] shadow-sm"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="pr-4">
                      <h4 className="font-bold text-[#111111]">Email Promo & Diskon</h4>
                      <p className="text-sm text-[#888888] mt-0.5">Dapatkan informasi penawaran khusus dan potongan harga sewa lapangan.</p>
                    </div>
                    <button className="w-12 h-6 bg-[#2FA084] rounded-full flex-shrink-0 relative transition-colors duration-300 focus:outline-none shadow-inner">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] right-[2px] shadow-sm"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="pr-4">
                      <h4 className="font-bold text-[#111111]">Aktivitas Teman</h4>
                      <p className="text-sm text-[#888888] mt-0.5">Beri tahu saya ketika teman membagikan jadwal mabar mereka.</p>
                    </div>
                    <button className="w-12 h-6 bg-[#CCCCCC] rounded-full flex-shrink-0 relative transition-colors duration-300 focus:outline-none hover:bg-[#888888] shadow-inner">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] shadow-sm"></div>
                    </button>
                  </div>
                </div>
              )}

              {/* --- TAB 4: PEMBAYARAN --- */}
              {activeTab === 'payment' && (
                <div className="space-y-6 animate-fade-in">
                  <p className="text-sm text-[#888888] mb-4">Kelola metode pembayaran yang terhubung untuk mempermudah checkout booking lapangan.</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-[#2FA084] bg-[#2FA084]/5 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-[#EEEEEE] font-black text-[#00AEEF] text-xs italic">gopay</div>
                        <div>
                          <h4 className="font-bold text-[#111111] text-sm">Gopay (Utama)</h4>
                          <p className="text-xs text-[#888888]">0812-****-7890</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Putuskan</button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#EEEEEE] bg-[#F8F8F8] rounded-xl hover:border-[#CCCCCC] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-[#EEEEEE] font-bold text-blue-800 text-[10px]">BCA VA</div>
                        <div>
                          <h4 className="font-bold text-[#111111] text-sm">Transfer Bank</h4>
                          <p className="text-xs text-[#888888]">Virtual Account</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-2 py-3 border-2 border-dashed border-[#CCCCCC] rounded-xl text-[#888888] font-bold text-sm hover:border-[#2FA084] hover:text-[#2FA084] transition-colors bg-white">
                    + Tambah Metode Pembayaran Lain
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* TOAST NOTIFICATION */}
      {/* ========================================= */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="bg-white border-l-4 border-[#2FA084] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-r-xl rounded-l-sm p-4 flex items-center gap-3 min-w-[280px]">
            <div className="w-8 h-8 bg-[#2FA084]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#2FA084]">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#111111] text-sm">Informasi</h4>
              <p className="text-[#888888] text-xs mt-0.5">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}