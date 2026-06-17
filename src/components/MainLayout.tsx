import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F8F8]">
      {/* 1. Navbar selalu nempel di atas */}
      <Navbar />

      {/* 2. Outlet adalah tempat merender halaman (Home, Booking, Store, dll) */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 3. Footer menahan bagian paling bawah */}
      <Footer />
    </div>
  );
}