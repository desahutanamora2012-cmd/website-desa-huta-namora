import { Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";

export default function FloatingContact() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Tampilkan tombol setelah beberapa saat agar tidak menutupi animasi awal
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <Link
      to="/kontak"
      className="fixed bottom-[60px] right-6 md:right-8 z-[60] flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-500 hover:scale-110 transition-all duration-300 group"
      aria-label="Buka Halaman Kontak"
    >
      <Phone className="w-6 h-6" />
      <span className="absolute right-full mr-3 whitespace-nowrap bg-white text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Hubungi Kami
      </span>
      {/* Ping effect */}
      <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-20 group-hover:animate-ping -z-10"></span>
    </Link>
  );
}
