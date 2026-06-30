import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle2, Users, Tag, Info, Check, CheckCheck } from 'lucide-react';
import { api } from '../services/api';

interface AppNotification {
  id: string | number;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link: string;
}

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState<'semua' | 'belum_dibaca'>('semua');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.success) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [navigate]);

  // Filter notifikasi berdasarkan tab
  const filteredNotifications = notifications.filter(notif => 
    activeTab === 'semua' ? true : !notif.isRead
  );

  // Fungsi untuk menandai satu notifikasi sudah dibaca
  const markAsRead = async (id: string | number) => {
    try {
      const res = await api.post(`/notifications/${id}/read`, {});
      if (res.success) {
        setNotifications(notifications.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        ));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fungsi untuk menandai semua notifikasi sudah dibaca
  const markAllAsRead = async () => {
    try {
      const res = await api.post(`/notifications/read-all`, {});
      if (res.success) {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper untuk menentukan Ikon berdasarkan tipe notifikasi
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-2.5 bg-green-100 text-green-600 rounded-full"><CheckCircle2 className="w-5 h-5" /></div>;
      case 'invite': return <div className="p-2.5 bg-blue-100 text-blue-600 rounded-full"><Users className="w-5 h-5" /></div>;
      case 'promo': return <div className="p-2.5 bg-orange-100 text-orange-500 rounded-full"><Tag className="w-5 h-5" /></div>;
      default: return <div className="p-2.5 bg-gray-100 text-gray-500 rounded-full"><Info className="w-5 h-5" /></div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 pb-24 font-sans">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-[#888888] hover:text-[#111111] transition-colors text-sm font-semibold mb-4">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight flex items-center gap-3">
              Notifikasi {unreadCount > 0 && <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">{unreadCount} Baru</span>}
            </h1>
          </div>
          
          <button type="button" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#2FA084] hover:text-[#1F6F5F] disabled:text-[#CCCCCC] transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Tandai semua dibaca
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-[#EEEEEE]">
          <button type="button" 
            onClick={() => setActiveTab('semua')}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'semua' ? 'text-[#111111]' : 'text-[#888888] hover:text-[#444444]'}`}
          >
            Semua
            {activeTab === 'semua' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2FA084] rounded-t-full"></div>}
          </button>
          <button type="button" 
            onClick={() => setActiveTab('belum_dibaca')}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'belum_dibaca' ? 'text-[#111111]' : 'text-[#888888] hover:text-[#444444]'}`}
          >
            Belum Dibaca
            {activeTab === 'belum_dibaca' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2FA084] rounded-t-full"></div>}
          </button>
        </div>

        {/* LIST NOTIFIKASI */}
        <div className="space-y-4 animate-fade-in">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#2FA084] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`p-5 rounded-2xl border transition-all flex gap-4 items-start ${
                  notif.isRead 
                  ? 'bg-white border-[#EEEEEE]' 
                  : 'bg-[#F0FDF8] border-[#2FA084]/30 shadow-[0_4px_20px_rgba(47,160,132,0.08)] cursor-pointer'
                }`}
              >
                {getIcon(notif.type)}
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <h3 className={`text-base font-bold ${notif.isRead ? 'text-[#444444]' : 'text-[#111111]'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-semibold text-[#888888] whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className={`text-sm leading-relaxed mb-3 ${notif.isRead ? 'text-[#888888]' : 'text-[#444444]'}`}>
                    {notif.message}
                  </p>
                  
                  {notif.link && notif.link !== '#' && (
                    <Link 
                      to={notif.link}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2FA084] hover:text-[#1F6F5F] transition-colors"
                    >
                      Lihat Detail &rarr;
                    </Link>
                  )}
                </div>
                
                {/* Titik indikator belum dibaca */}
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 bg-[#2FA084] rounded-full mt-2 flex-shrink-0"></div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-[#CCCCCC]">
              <Bell className="w-12 h-12 text-[#EEEEEE] mb-4" />
              <h3 className="text-lg font-bold text-[#444444] mb-1">Kosong, nih!</h3>
              <p className="text-[#888888] text-sm">Tidak ada notifikasi baru untuk Anda saat ini.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}