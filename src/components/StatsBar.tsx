import { Users, MapPin, Trophy } from 'lucide-react';

export default function StatsBar() {
  const stats = [
    { id: 1, icon: Trophy, value: '50+', label: 'Lapangan Premium' },
    { id: 2, icon: Users, value: '10,000+', label: 'Pengguna Aktif' },
    { id: 3, icon: MapPin, value: '15+', label: 'Kota Jangkauan' },
  ];

  return (
    <section className="w-full bg-[#1F6F5F] py-8 sm:py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#6FCF97]/30 text-center">
          
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="flex flex-col items-center justify-center pt-8 md:pt-0 first:pt-0">
                <div className="bg-[#2FA084]/20 p-3 rounded-full mb-4">
                  <Icon className="w-6 h-6 text-[#6FCF97]" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{stat.value}</h3>
                <p className="text-[#D1E9E3] font-medium text-sm sm:text-base">{stat.label}</p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}