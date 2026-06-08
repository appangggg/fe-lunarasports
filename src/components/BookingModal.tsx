import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Star,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lapangan: any;
}

export default function BookingModal({
  isOpen,
  onClose,
  lapangan,
}: BookingModalProps) {
  const navigate = useNavigate();

  // =========================================
  // STATE MANAGEMENT
  // =========================================
  const [courtsList, setCourtsList] = useState<any[]>([]);
  const [isLoadingCourts, setIsLoadingCourts] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [showAllRules, setShowAllRules] = useState(false);

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString("id-ID", { weekday: "short" }),
      date: d.getDate(),
      fullDate: d,
    };
  });

  const timeSlots = [
    { time: "16:00", status: "available" },
    { time: "17:00", status: "booked" },
    { time: "18:00", status: "available" },
    { time: "19:00", status: "available" },
    { time: "20:00", status: "booked" },
    { time: "21:00", status: "available" },
    { time: "22:00", status: "available" },
    { time: "23:00", status: "available" },
  ];

  useEffect(() => {
    const fetchCourts = async () => {
      setIsLoadingCourts(true);
      try {
        const response = await api.get("/courts");
        if (response.success && response.data.length > 0) {
          setCourtsList(response.data);
          setSelectedCourt(response.data[0]); // Auto-pilih lapangan pertama dari database
        }
      } catch (error) {
        console.error("Gagal menarik data lapangan:", error);
      } finally {
        setIsLoadingCourts(false);
      }
    };

    if (isOpen) {
      fetchCourts(); // Panggil data dari Laravel saat modal terbuka
      setSelectedTimes([]);
      setSelectedDate(0);
      setShowAllRules(false);
    }
  }, [isOpen]);

  if (!isOpen || !lapangan || !selectedCourt) return null;

  const toggleTimeSlot = (time: string, status: string) => {
    if (status === "booked") return;
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time].sort());
    }
  };

  const totalPrice = selectedCourt.harga * selectedTimes.length;

  const handleCheckout = () => {
    if (selectedTimes.length === 0) return;

    const bookingData = {
      venue: lapangan.name,
      court: selectedCourt.name,
      date: dates[selectedDate].fullDate,
      times: selectedTimes,
      totalPrice: totalPrice,
      image: selectedCourt.image,
    };
    localStorage.setItem("pending_booking", JSON.stringify(bookingData));

    onClose();
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* PERBAIKAN 1: Gunakan tinggi absolut (h-[90vh] di HP, h-[85vh] di Desktop) 
        agar modal punya batas yang pasti dan tidak bablas menembus layar bawah.
      */}
      <div className="relative bg-white rounded-3xl w-full max-w-5xl h-[90vh] md:h-[85vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/30 text-white md:text-[#111111] md:bg-[#F8F8F8] md:hover:bg-[#EEEEEE] rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================= */}
        {/* KOLOM KIRI */}
        {/* PERBAIKAN 2: Batasi tinggi maksimal 40% di HP agar area form di bawahnya dapat ruang yang cukup */}
        {/* ========================================= */}
        <div className="w-full md:w-2/5 h-[40%] md:h-full shrink-0 bg-[#F8F8F8] overflow-y-auto hide-scrollbar border-r border-[#EEEEEE] flex flex-col">
          <div className="relative h-48 sm:h-64 shrink-0">
            <img
              src={selectedCourt.image}
              alt={selectedCourt.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
              <span className="bg-[#2FA084] text-white text-[10px] font-bold px-2.5 py-1 rounded-md w-max mb-2 uppercase tracking-wider shadow-sm">
                {lapangan.kategori}
              </span>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {lapangan.name}
              </h2>
              <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                <MapPin className="w-4 h-4" /> {lapangan.lokasi}
              </div>
            </div>
          </div>

          <div className="p-6 flex-grow">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#EEEEEE]">
              <div>
                <p className="text-xs text-[#888888] font-bold uppercase tracking-wider mb-1">
                  Rating Venue
                </p>
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-[#F2C94C] fill-[#F2C94C]" />
                  <span className="font-bold text-[#111111] text-lg">
                    {lapangan.rating}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#888888] font-bold uppercase tracking-wider mb-1">
                  Harga per Jam
                </p>
                <span className="font-black text-[#2FA084] text-xl">
                  Rp {Number(selectedCourt.harga).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-[#111111] mb-3">Fasilitas Lengkap</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {lapangan.fasilitasLengkap &&
              lapangan.fasilitasLengkap.length > 0 ? (
                lapangan.fasilitasLengkap.map(
                  (fasilitas: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-[#555555]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#2FA084] shrink-0" />{" "}
                      <span className="truncate">{fasilitas}</span>
                    </div>
                  ),
                )
              ) : (
                <p className="text-sm text-[#888888] col-span-2">
                  Informasi fasilitas belum tersedia.
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 transition-all duration-300">
              <ShieldAlert className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="text-xs text-blue-800 leading-relaxed flex-1">
                <span className="font-bold block mb-2 text-sm">
                  Peraturan Venue:
                </span>

                {lapangan.peraturan && lapangan.peraturan.length > 0 ? (
                  <>
                    <ul className="list-disc pl-4 space-y-1.5">
                      {(showAllRules
                        ? lapangan.peraturan
                        : lapangan.peraturan.slice(0, 2)
                      ).map((rule: string, idx: number) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>

                    {lapangan.peraturan.length > 2 && (
                      <button
                        onClick={() => setShowAllRules(!showAllRules)}
                        className="mt-3 flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-100/50 hover:bg-blue-100 px-3 py-1.5 rounded-lg w-full justify-center"
                      >
                        {showAllRules ? (
                          <>
                            <ChevronUp className="w-4 h-4" /> Tutup Peraturan
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" /> Lihat{" "}
                            {lapangan.peraturan.length - 2} Aturan Lainnya
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p>
                    Wajib menggunakan sepatu olahraga. Dilarang merokok dan
                    membawa makanan dari luar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* KOLOM KANAN */}
        {/* PERBAIKAN 3: Sisa 60% ruang di HP diisi penuh oleh kolom kanan. */}
        {/* ========================================= */}
        <div className="w-full md:w-3/5 h-[60%] md:h-full flex flex-col bg-white">
          {/* AREA SCROLL KONTEN KANAN */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6 md:p-8">
            {/* 1. PILIH LAPANGAN SPESIFIK */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#111111] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  Pilih Area Lapangan
                </h3>
              </div>

              {isLoadingCourts ? (
                <div className="text-center p-4 bg-[#F8F8F8] rounded-xl text-sm font-bold text-[#888888] animate-pulse">
                  Mencari lapangan tersedia...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {courtsList.map((court: any) => (
                    <button
                      key={court.id}
                      onClick={() => {
                        setSelectedCourt(court);
                        setSelectedTimes([]);
                      }}
                      className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                        selectedCourt?.id === court.id
                          ? "border-[#2FA084] bg-[#F0FDF8] shadow-sm"
                          : "border-[#EEEEEE] bg-white hover:border-[#CCCCCC]"
                      }`}
                    >
                      <span
                        className={`font-bold text-sm line-clamp-1 ${selectedCourt?.id === court.id ? "text-[#2FA084]" : "text-[#111111]"}`}
                      >
                        {court.name}
                      </span>
                      <span className="text-xs font-semibold text-[#888888] mt-1">
                        Rp {Number(court.harga).toLocaleString("id-ID")}/jam
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. PILIH TANGGAL */}
            <div className="mb-8 border-t border-[#EEEEEE] pt-6">
              <h3 className="font-bold text-[#111111] flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs">
                  2
                </span>
                Pilih Tanggal Main
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {dates.map((d, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(idx);
                      setSelectedTimes([]);
                    }}
                    className={`flex flex-col items-center justify-center min-w-[72px] h-[84px] rounded-2xl border transition-all shrink-0 ${
                      selectedDate === idx
                        ? "bg-[#111111] border-[#111111] text-white shadow-md transform -translate-y-1"
                        : "bg-white border-[#EEEEEE] text-[#444444] hover:border-[#CCCCCC] hover:bg-[#F8F8F8]"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold uppercase ${selectedDate === idx ? "text-white/80" : "text-[#888888]"}`}
                    >
                      {d.day}
                    </span>
                    <span className="text-xl font-black mt-1">{d.date}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. PILIH JAM */}
            <div className="mb-4 border-t border-[#EEEEEE] pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#111111] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  Pilih Jam{" "}
                  <span className="text-xs font-normal text-[#888888]">
                    (Bisa lebih dari 1)
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((slot, idx) => {
                  const isSelected = selectedTimes.includes(slot.time);
                  const isBooked = slot.status === "booked";

                  return (
                    <button
                      key={idx}
                      disabled={isBooked}
                      onClick={() => toggleTimeSlot(slot.time, slot.status)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                        isBooked
                          ? "bg-[#F8F8F8] border-[#EEEEEE] text-[#CCCCCC] cursor-not-allowed line-through"
                          : isSelected
                            ? "bg-[#2FA084] border-[#2FA084] text-white shadow-md transform scale-105"
                            : "bg-white border-[#EEEEEE] text-[#111111] hover:border-[#2FA084] hover:text-[#2FA084]"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-5 bg-[#F8F8F8] p-3 rounded-xl border border-[#EEEEEE] w-max">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#555555]">
                  <div className="w-3 h-3 rounded-sm bg-white border border-[#CCCCCC]"></div>{" "}
                  Kosong
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#555555]">
                  <div className="w-3 h-3 rounded-sm bg-[#2FA084]"></div>{" "}
                  Dipilih
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#555555]">
                  <div className="w-3 h-3 rounded-sm bg-[#EEEEEE]"></div> Penuh
                </span>
              </div>
            </div>
          </div>

          {/* PERBAIKAN 4: Footer kini 100% terkunci menggunakan properti shrink-0 di dalam kontainer yang tingginya sudah dibatasi */}
          <div className="shrink-0 bg-white p-5 sm:p-6 border-t border-[#EEEEEE] flex items-center justify-between z-10">
            <div>
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-0.5">
                Total Pembayaran
              </p>
              {selectedTimes.length > 0 ? (
                <p className="text-xl sm:text-2xl font-black text-[#2FA084]">
                  Rp {totalPrice.toLocaleString("id-ID")}
                  <span className="text-[10px] sm:text-xs font-medium text-[#888888] ml-1">
                    ({selectedTimes.length} Jam)
                  </span>
                </p>
              ) : (
                <p className="text-lg font-bold text-[#111111]">-</p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={selectedTimes.length === 0}
              className={`flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold transition-all shadow-md ${
                selectedTimes.length > 0
                  ? "bg-[#111111] text-white hover:bg-[#2FA084] transform hover:-translate-y-0.5"
                  : "bg-[#EEEEEE] text-[#AAAAAA] cursor-not-allowed shadow-none"
              }`}
            >
              <span className="hidden sm:inline">Lanjut Bayar</span>
              <span className="sm:hidden">Bayar</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}