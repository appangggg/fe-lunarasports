import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Clock, Users, Swords, PlusCircle, X, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import PublicProfileModal from '../components/PublicProfileModal';

export default function MabarPage() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'explore' | 'my_mabars'>('explore');
  
  // STATE UTAMA
  const [mabarList, setMabarList] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // STATE LOADING
  const [isLoading, setIsLoading] = useState(true);

  // FETCH DATA MABAR DARI BACKEND
  const fetchMabars = async () => {
    try {
      setIsLoading(true);
      const query = activeFilter !== 'Semua' ? `?sport=${activeFilter}` : '';
      const endpoint = activeTab === 'explore' ? `/mabars${query}` : '/mabars/my-mabars';
      const res = await api.get(endpoint);
      if (res.success) {
        setMabarList(res.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data mabar', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMabars();
  }, [activeFilter, activeTab]);

  // Form State untuk Buat Jadwal Baru
  const [formData, setFormData] = useState({
    sport: 'Futsal',
    title: '',
    venue: '',
    date: '',
    time: '',
    slots: '',
    price: ''
  });

  // FUNGSI GABUNG MABAR KE BACKEND
  const handleJoin = async (mabarId: number, hostName: string) => {
    try {
      const res = await api.post(`/mabars/${mabarId}/join`, {});
      if (res.success) {
        setToastMessage(`Berhasil request join! Menunggu konfirmasi dari ${hostName}.`);
        fetchMabars(); // Update quota view
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Gagal join mabar');
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  // FUNGSI APPROVE/REJECT OLEH HOST
  const handleApproveReject = async (mabarId: number, userId: number, action: 'approve' | 'reject') => {
    try {
      const res = await api.post(`/mabars/${mabarId}/approve/${userId}`, { action });
      if (res.success) {
        setToastMessage(`Peserta berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}!`);
        fetchMabars(); // Refresh data untuk update daftar partisipan
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Gagal memproses request');
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  // FUNGSI BUAT JADWAL MABAR BARU KE BACKEND
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        title: formData.title,
        sport_type: formData.sport,
        venue_name: formData.venue,
        date: formData.date,
        time: formData.time,
        max_participants: parseInt(formData.slots),
        price_per_person: parseInt(formData.price)
      };

      const res = await api.post('/mabars', payload);
      
      if (res.success) {
        setShowCreateModal(false);
        setFormData({ sport: 'Futsal', title: '', venue: '', date: '', time: '', slots: '', price: '' });
        setToastMessage('Jadwal Mabar berhasil dipublikasikan!');
        setTimeout(() => setToastMessage(''), 3500);
        fetchMabars(); // Reload data
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Gagal membuat jadwal mabar');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  // LOGIKA PENCARIAN (Filter lokal berdasarkan input search)
  const filteredMabar = mabarList.filter(mabar => {
    const venueName = mabar.venue_name || '';
    const hostName = mabar.host?.name || '';
    return venueName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           hostName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // =========================================
  // KOMPONEN SKELETON LOADING
  // =========================================
  const SkeletonMabarCard = () => (
    <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden shadow-sm flex flex-col h-[380px]">
      <div className="p-5 border-b border-[#EEEEEE] flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#EEEEEE] animate-pulse"></div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-[#EEEEEE] rounded animate-pulse"></div>
            <div className="w-16 h-3 bg-[#EEEEEE] rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-16 h-6 bg-[#EEEEEE] rounded-full animate-pulse"></div>
      </div>
      <div className="p-5 space-y-5 flex-grow">
        <div className="w-2/3 h-6 bg-[#EEEEEE] rounded animate-pulse"></div>
        <div className="space-y-3">
          <div className="w-full h-4 bg-[#EEEEEE] rounded animate-pulse"></div>
          <div className="w-3/4 h-4 bg-[#EEEEEE] rounded animate-pulse"></div>
          <div className="w-1/2 h-4 bg-[#EEEEEE] rounded animate-pulse"></div>
        </div>
        <div className="w-full h-12 bg-[#EEEEEE] rounded-xl animate-pulse mt-4"></div>
      </div>
      <div className="p-5 pt-0 mt-auto">
        <div className="w-full h-12 bg-[#EEEEEE] rounded-xl animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 pb-24 font-sans relative">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#2FA084]" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER & CALL TO ACTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Cari Teman <span className="text-[#2FA084]">Mabar</span>
            </h1>
            <p className="text-[#888888] mt-2 text-sm md:text-base max-w-xl">
              Kurang orang buat main futsal atau butuh lawan sparring badminton? Cari atau buat jadwal mabar-mu di sini!
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-[#2FA084] transition-all shadow-md transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5" /> Buat Jadwal Mabar
          </button>
        </div>

        {/* TABS EXPLORE VS MY MABARS */}
        <div className="flex bg-[#EEEEEE] p-1.5 rounded-2xl mb-8 shadow-inner w-full md:w-max">
          <button 
            onClick={() => setActiveTab('explore')}
            className={`px-8 py-3 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'explore' ? 'bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-[#888888] hover:text-[#111111]'}`}
          >
            <Search className="w-4 h-4" /> Cari Mabar
          </button>
          <button 
            onClick={() => setActiveTab('my_mabars')}
            className={`px-8 py-3 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'my_mabars' ? 'bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-[#888888] hover:text-[#111111]'}`}
          >
            <Users className="w-4 h-4" /> Mabar Saya
          </button>
        </div>

        {/* SEARCH & FILTER SECTION */}
        <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm mb-8 flex flex-col md:flex-row gap-4 sticky top-24 z-30">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-[#888888]" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi venue atau nama host..." 
              className="w-full pl-11 pr-4 py-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl focus:outline-none focus:border-[#2FA084] focus:bg-white focus:ring-2 focus:ring-[#2FA084]/20 text-[#111111] font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['Semua', 'Futsal', 'Badminton', 'Mini Soccer'].map((filter) => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  activeFilter === filter 
                  ? 'bg-[#2FA084] text-white shadow-md' 
                  : 'bg-[#F8F8F8] text-[#888888] hover:bg-[#EEEEEE] border border-[#EEEEEE]'
                }`}
              >
                {filter}
              </button>
            ))}
            <button className="px-4 py-3 rounded-xl bg-[#F8F8F8] border border-[#EEEEEE] text-[#111111] hover:bg-[#EEEEEE] transition-all flex items-center justify-center flex-shrink-0">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GRID KARTU MABAR (DENGAN SKELETON) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => <SkeletonMabarCard key={n} />)}
          </div>
        ) : filteredMabar.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredMabar.map((mabar) => {
              const hostName = mabar.host?.name || 'Unknown';
              const avatarBg = mabar.sport_type === 'Futsal' ? 'bg-[#2FA084]' : 'bg-amber-500';
              
              return (
                <div key={mabar.id} className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#2FA084]/50 transition-all duration-300 group flex flex-col">
                  
                  {/* Header Kartu */}
                  <div className="p-5 border-b border-[#EEEEEE] flex justify-between items-start">
                    <div 
                      className="flex items-center gap-3 cursor-pointer group/host"
                      onClick={() => mabar.host_id && setSelectedUserId(mabar.host_id)}
                    >
                      <div className={`w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center text-white font-black text-xl shadow-inner uppercase group-hover/host:ring-2 ring-offset-2 ring-[#2FA084] transition-all`}>
                        {hostName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#111111] leading-tight group-hover/host:text-[#2FA084] transition-colors">{hostName}</h3>
                        <p className="text-xs text-[#888888] font-medium mt-0.5">Host Mabar</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      mabar.sport_type === 'Futsal' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {mabar.sport_type}
                    </span>
                  </div>

                  {/* Body Kartu */}
                  <div className="p-5 space-y-4 flex-grow">
                    <div>
                      <h4 className="font-extrabold text-[#111111] text-lg flex items-center gap-2">
                        <Swords className="w-5 h-5 text-[#2FA084]" /> {mabar.title}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-[#888888] mt-0.5 flex-shrink-0" />
                        <span className="text-[#555555] font-medium">{mabar.venue_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-[#888888] flex-shrink-0" />
                        <span className="text-[#555555] font-medium">{mabar.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-[#888888] flex-shrink-0" />
                        <span className="text-[#555555] font-medium">{mabar.time}</span>
                      </div>
                    </div>

                    {/* Info Slot & Harga */}
                    <div className="flex items-center justify-between p-3 bg-[#F8F8F8] rounded-xl border border-[#EEEEEE] mt-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#2FA084]" />
                        <span className="text-xs font-bold text-[#111111]">
                          {mabar.participants?.filter((p:any) => p.pivot.status === 'approved').length || 0} / {mabar.max_participants} Orang
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#2FA084] bg-[#2FA084]/10 px-2 py-1 rounded-md">Rp {mabar.price_per_person.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Join / Manajemen Host */}
                  <div className="p-5 pt-0 mt-auto">
                    {activeTab === 'explore' ? (
                      <button 
                        onClick={() => handleJoin(mabar.id, hostName)}
                        disabled={mabar.status === 'full'}
                        className={`w-full py-3 rounded-xl font-bold text-sm shadow-md flex justify-center items-center gap-2 transition-colors ${mabar.status === 'full' ? 'bg-[#EEEEEE] text-[#AAAAAA] cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-[#2FA084]'}`}
                      >
                        {mabar.status === 'full' ? 'Mabar Penuh' : 'Gabung Mabar'}
                      </button>
                    ) : (
                      <div className="space-y-3 bg-[#FAFAFA] p-3 rounded-xl border border-[#EEEEEE]">
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-2">Request Partisipan:</p>
                        {(!mabar.participants || mabar.participants.length === 0) && (
                          <p className="text-xs text-[#888888] italic text-center py-2">Belum ada request</p>
                        )}
                        {mabar.participants?.map((participant: any) => (
                          <div key={participant.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#EEEEEE] shadow-sm">
                            <div 
                              className="cursor-pointer group/participant"
                              onClick={() => setSelectedUserId(participant.id)}
                            >
                              <p className="text-sm font-bold text-[#111111] group-hover/participant:text-[#2FA084] transition-colors">{participant.name}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                                participant.pivot.status === 'approved' ? 'bg-[#F0FDF8] text-[#2FA084]' : 
                                participant.pivot.status === 'rejected' ? 'bg-red-50 text-red-500' : 
                                'bg-amber-50 text-amber-600'
                              }`}>
                                {participant.pivot.status === 'pending' ? 'Menunggu' : 
                                 participant.pivot.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                              </span>
                            </div>
                            
                            {participant.pivot.status === 'pending' && (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => handleApproveReject(mabar.id, participant.id, 'approve')} className="w-8 h-8 rounded-full bg-[#2FA084]/10 text-[#2FA084] flex items-center justify-center hover:bg-[#2FA084] hover:text-white transition-colors" title="Setujui">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleApproveReject(mabar.id, participant.id, 'reject')} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="Tolak">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-[#CCCCCC] animate-fade-in">
            <p className="text-[#888888] font-medium">Jadwal mabar tidak ditemukan. Jadilah yang pertama membuatnya!</p>
          </div>
        )}

      </div>

      {/* MODAL BUAT JADWAL MABAR BARU */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-[#EEEEEE] flex justify-between items-center bg-[#F8F8F8]">
              <div>
                <h2 className="text-xl font-extrabold text-[#111111]">Buat Jadwal Mabar</h2>
                <p className="text-xs text-[#888888] mt-1">Isi detail kegiatan untuk mencari lawan atau teman main.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white rounded-full hover:bg-[#EEEEEE] transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto hide-scrollbar">
              <form id="createMabarForm" onSubmit={handleCreateSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#888888] uppercase mb-1">Olahraga</label>
                    <select 
                      required
                      value={formData.sport}
                      onChange={(e) => setFormData({...formData, sport: e.target.value})}
                      className="w-full p-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2FA084]"
                    >
                      <option value="Futsal">Futsal</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Mini Soccer">Mini Soccer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#888888] uppercase mb-1">Judul / Tipe Mabar</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Cth: Fun Match Futsal"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2FA084]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#888888] uppercase mb-1">Lokasi Venue</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Cth: Gelora Futsal Arena - Lap. A"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full p-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2FA084]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#888888] uppercase mb-1">Tanggal</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2FA084]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#888888] uppercase mb-1">Waktu</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Cth: 19:00 - 21:00"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full p-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2FA084]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#888888] uppercase mb-1">Max Peserta</label>
                    <input 
                      required
                      type="number" 
                      min="2"
                      placeholder="Cth: 10"
                      value={formData.slots}
                      onChange={(e) => setFormData({...formData, slots: e.target.value})}
                      className="w-full p-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2FA084]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#888888] uppercase mb-1">Harga/Orang (Rp)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      placeholder="Cth: 20000"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full p-3 bg-[#F8F8F8] border border-[#EEEEEE] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2FA084]"
                    />
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-[#EEEEEE] bg-white">
              <button 
                type="submit" 
                form="createMabarForm"
                className="w-full py-3.5 bg-[#2FA084] text-white rounded-xl font-bold shadow-md hover:bg-[#1F6F5F] transition-colors"
              >
                Publikasikan Jadwal
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PUBLIC PROFILE */}
      {selectedUserId && (
        <PublicProfileModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}

    </div>
  );
}