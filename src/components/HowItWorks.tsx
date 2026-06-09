import { Search, CalendarDays, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      icon: Search,
      title: 'Find Venue',
      description: 'Search by sport, location, and availability to find the perfect field for your team.'
    },
    {
      id: 2,
      icon: CalendarDays,
      title: 'Pick a Time',
      description: 'Select your preferred date and time slot from real-time schedules.'
    },
    {
      id: 3,
      icon: CheckCircle2,
      title: 'Book & Play',
      description: 'Pay securely online and get instant confirmation. Just show up and play.'
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#EEEEEE]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111111] tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-[#888888] text-base md:text-lg max-w-2xl mx-auto">
            Book your next game in three simple steps. No phone calls, no waiting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {/* Garis Penghubung (Hanya terlihat di Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#CCCCCC] to-transparent z-0"></div>

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-[#EEEEEE] flex items-center justify-center mb-6 relative group hover:-translate-y-2 transition-transform duration-300">
                  <Icon className="w-10 h-10 text-[#2FA084] group-hover:scale-110 transition-transform duration-300" />
                  {/* Angka Step */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#1F6F5F] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-3">{step.title}</h3>
                <p className="text-[#444444] text-sm md:text-base leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}