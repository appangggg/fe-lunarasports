import { useState, useEffect } from 'react';
import { X, Swords, Calendar } from 'lucide-react';
import { api } from '../services/api';

interface PublicProfileModalProps {
  userId: number;
  onClose: () => void;
}

export default function PublicProfileModal({ userId, onClose }: PublicProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/users/${userId}/profile`);
        if (res.success) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error('Gagal mengambil profil public', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative transform transition-all">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#111111] to-[#333333] p-6 text-center relative h-32">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body Modal */}
        <div className="px-6 pb-8 pt-0 relative flex flex-col items-center">
          {isLoading ? (
            <div className="w-24 h-24 rounded-full bg-[#EEEEEE] animate-pulse border-4 border-white shadow-md -mt-12 mb-4"></div>
          ) : (
            <img 
              src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=2FA084&color=fff&size=128&rounded=true&bold=true`} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md -mt-12 mb-4 relative z-10 bg-white"
            />
          )}

          {isLoading ? (
            <div className="w-32 h-6 bg-[#EEEEEE] animate-pulse rounded mb-2"></div>
          ) : (
            <h3 className="text-xl font-extrabold text-[#111111] leading-tight">{profile?.name}</h3>
          )}

          {isLoading ? (
            <div className="w-24 h-4 bg-[#EEEEEE] animate-pulse rounded mb-6"></div>
          ) : (
            <p className="text-sm text-[#888888] font-medium mt-0.5 uppercase tracking-wider mb-6">
              {profile?.role || 'Member'}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-[#F8F8F8] p-3 rounded-xl border border-[#EEEEEE] text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2FA084] flex items-center justify-center mb-1">
                <Swords className="w-4 h-4" />
              </div>
              {isLoading ? (
                <div className="w-8 h-6 bg-[#EEEEEE] animate-pulse rounded my-1"></div>
              ) : (
                <span className="font-black text-[#111111] text-lg">{profile?.hosted_mabars_count || 0}</span>
              )}
              <span className="text-[10px] font-bold text-[#888888] uppercase">Host Mabar</span>
            </div>

            <div className="bg-[#F8F8F8] p-3 rounded-xl border border-[#EEEEEE] text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#FFF9E6] text-[#F2C94C] flex items-center justify-center mb-1">
                <Calendar className="w-4 h-4" />
              </div>
              {isLoading ? (
                <div className="w-16 h-4 bg-[#EEEEEE] animate-pulse rounded my-2"></div>
              ) : (
                <span className="font-bold text-[#111111] text-xs mt-1">
                  {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2026'}
                </span>
              )}
              <span className="text-[10px] font-bold text-[#888888] uppercase mt-1">Bergabung</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
