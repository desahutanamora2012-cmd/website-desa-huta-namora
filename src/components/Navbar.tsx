import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Menu,
  X,
  Home,
  Building2,
  Users,
  ClipboardList,
  FileBarChart,
  Sprout,
  Newspaper,
  Phone,
  Shield,
  MapPin,
  BookOpen,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DriveImage from "@/components/DriveImage";

const menuItems = [
  { label: "Beranda", path: "/", icon: Home },
  {
    label: "Profil Desa",
    icon: Building2,
    children: [
      { label: "Sejarah & Visi Misi", path: "/profil/sejarah" },
      { label: "Kondisi Geografis", path: "/profil/geografis" },
      { label: "Statistik Desa", path: "/profil/statistik" },
    ],
  },
  {
    label: "Pemerintahan",
    icon: Users,
    children: [
      { label: "Struktur Organisasi", path: "/pemerintahan/struktur" },
      { label: "BPD", path: "/pemerintahan/bpd" },
      { label: "Lembaga Kemasyarakatan", path: "/pemerintahan/lembaga" },
    ],
  },
  {
    label: "Layanan Publik",
    icon: ClipboardList,
    children: [
      { label: "Panduan Layanan", path: "/layanan/panduan" },
      { label: "Unduh Dokumen", path: "/layanan/dokumen" },
      { label: "Layanan Mandiri", path: "/layanan/mandiri" },
    ],
  },
  {
    label: "Transparansi",
    icon: FileBarChart,
    children: [
      { label: "APBDes", path: "/transparansi/apbdes" },
      { label: "Galeri", path: "/transparansi/galeri" },
      { label: "Infografis", path: "/transparansi/infografis" },
    ],
  },
  {
    label: "Potensi Desa",
    icon: MapPin,
    children: [
      { label: "Penginapan", path: "/potensi/penginapan", icon: MapPin },
      { label: "Objek Wisata", path: "/potensi/objek-wisata", icon: MapPin },
      { label: "Pendidikan", path: "/potensi/pendidikan", icon: BookOpen },
      { label: "Kesehatan", path: "/potensi/kesehatan", icon: Heart },
      { label: "Ekonomi", path: "/potensi/ekonomi", icon: TrendingUp },
    ],
  },
  { label: "Berita", path: "/berita", icon: Newspaper },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { data: profil } = trpc.desa.profil.list.useQuery();
  const { data: temaWebsite } = trpc.desa.tema.temaWebsite.list.useQuery();

  const tema = Array.isArray(temaWebsite) ? temaWebsite[0] : temaWebsite;

  const namaDesa = profil?.nama_desa || "Desa Cantik";
  const logoUrl = profil?.logo_url || (tema as any)?.logoUrl || (tema as any)?.logoKecilUrl || "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            : "bg-white"
        }`}
      >
        {/* Top Bar */}
        <div className="bg-primary text-primary-foreground text-xs py-2 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium tracking-wide">{namaDesa}</span>
              <span className="hidden sm:inline opacity-50">|</span>
              <span className="hidden sm:inline text-primary-foreground/80">
                {profil?.kabupaten
                  ? `${profil.kecamatan}, ${profil.kabupaten}`
                  : "Kecamatan, Kabupaten"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="flex items-center gap-1.5 hover:text-white/80 transition-colors bg-white/10 px-3 py-1 rounded-full"
              >
                <Shield className="w-3 h-3" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0 mr-4">
              {logoUrl ? (
                <DriveImage src={logoUrl} alt="Logo" className="h-9 w-9 rounded object-contain group-hover:scale-105 transition-transform" />
              ) : (
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-primary group-hover:scale-105 transition-transform shadow-sm">
                    <Home className="h-5 w-5 text-primary-foreground" />
                  </div>
              )}
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-sm leading-tight text-primary whitespace-nowrap">
                  {namaDesa}
                </h1>
                <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-0.5 whitespace-nowrap">
                  Website Resmi Desa
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-1 justify-center mr-8">
              <div className="flex items-center gap-2">
                {menuItems.map((item) =>
                  item.children ? (
                    <div
                      key={item.label}
                      className="relative group"
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {/* Trigger Button */}
                      <button
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                          item.children.some((c) => isActive(c.path))
                            ? "text-primary bg-primary/5"
                            : "text-gray-600 hover:text-primary hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                        <svg
                          className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${
                            openDropdown === item.label ? "rotate-180 text-primary" : "text-gray-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Content */}
                      {openDropdown === item.label && (
                        <div className="absolute top-full left-0 pt-2 z-50">
                          <div className="w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-primary/5 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                            <div className="py-1.5">
                              {item.children.map((child) => (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => setOpenDropdown(null)}
                                  className={`block px-4 py-2 text-[13px] transition-colors ${
                                    isActive(child.path)
                                      ? "bg-primary/5 text-primary font-bold"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-primary font-medium"
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path!}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                        isActive(item.path!)
                          ? "text-primary bg-primary/5"
                          : "text-gray-600 hover:text-primary hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary ml-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="font-extrabold text-primary text-lg">Menu Navigasi</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-full bg-gray-100 hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-700" />
          </Button>
        </div>
        
        <div className="p-4 space-y-2">
          {menuItems.map((item) =>
            item.children ? (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-800 uppercase tracking-wider mt-2">
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.label}
                </div>
                <div className="pl-4 space-y-1 border-l-2 border-gray-100 ml-6">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`block px-4 py-2.5 rounded-xl text-sm transition-colors ${
                        isActive(child.path)
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-gray-600 hover:bg-gray-50 font-medium"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path!}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive(item.path!)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          )}
        </div>
      </div>
    </>
  );
}
