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

const menuItems = [
  { label: "Beranda", path: "/", icon: Home },
  {
    label: "Profil Desa",
    icon: Building2,
    children: [
      { label: "Sejarah & Visi Misi", path: "/profil/sejarah" },
      { label: "Kondisi Geografis", path: "/profil/geografis" },
      { label: "Demografi Penduduk", path: "/profil/demografi" },
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
      { label: "Galeri Infografis", path: "/transparansi/galeri" },
    ],
  },
  {
    label: "Potensi Desa",
    icon: MapPin,
    children: [
      { label: "Pariwisata", path: "/potensi/pariwisata", icon: MapPin },
      { label: "Pendidikan", path: "/potensi/pendidikan", icon: BookOpen },
      { label: "Kesehatan", path: "/potensi/kesehatan", icon: Heart },
      { label: "Ekonomi", path: "/potensi/ekonomi", icon: TrendingUp },
    ],
  },
  { label: "Berita", path: "/berita", icon: Newspaper },
  { label: "Kontak", path: "/kontak", icon: Phone },
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

  const warnaPrimer = tema?.warnaPrimer || "#065f46";
  const warnaAccent = tema?.warnaAccent || "#dc2626";
  const warnaSkunder = tema?.warnaSkunder || "#f3f4f6";

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
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white shadow-sm"
      }`}
    >
      {/* Top Bar */}
      <div
        className="text-white text-xs py-1.5"
        style={{ backgroundColor: warnaPrimer }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>{namaDesa}</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              {profil?.kabupaten
                ? `${profil.kecamatan}, ${profil.kabupaten}`
                : "Kecamatan, Kabupaten"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="flex items-center gap-1 hover:text-emerald-200 transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded" />
            ) : (
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: warnaPrimer }}
                >
                  <Home className="h-5 w-5 text-white" />
                </div>
            )}
            <div className="hidden sm:block">
              <h1
                className="font-bold text-sm leading-tight"
                style={{ color: warnaPrimer }}
              >
                {namaDesa}
              </h1>
              <p className="text-[10px]" style={{ color: warnaAccent }}>
                Website Resmi Pemerintah Desa
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex gap-1">
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
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        item.children.some((c) => isActive(c.path))
                          ? "text-emerald-700 bg-emerald-50"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                      <svg
                        className={`w-3 h-3 ml-1 transition-transform ${
                          openDropdown === item.label ? "rotate-180" : ""
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
                      <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setOpenDropdown(null)}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                isActive(child.path)
                                  ? "bg-emerald-50 text-emerald-700 font-medium"
                                  : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path!}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive(item.path!)
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {menuItems.map((item) =>
              item.children ? (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`block pl-10 pr-3 py-2 rounded-md text-sm ${
                        isActive(child.path)
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path!)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
