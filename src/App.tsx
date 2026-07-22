import { Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { useSiteMetadata } from "@/hooks/useSiteMetadata";

// Public Pages
import Home from "./pages/Home";
import SejarahPage from "./pages/profil/Sejarah";
import GeografisPage from "./pages/profil/Geografis";
import StatistikPage from "./pages/profil/Statistik";
import DusunPage from "./pages/profil/Dusun";
import StrukturPage from "./pages/pemerintahan/Struktur";
import SotkPage from "./pages/pemerintahan/Sotk";
import BPDPage from "./pages/pemerintahan/BPD";
import LembagaPage from "./pages/pemerintahan/Lembaga";
import PanduanPage from "./pages/layanan/Panduan";
import DokumenPage from "./pages/layanan/Dokumen";
import MandiriPage from "./pages/layanan/Mandiri";
import ApbdesPage from "./pages/transparansi/Apbdes";
import GaleriPage from "./pages/transparansi/Galeri";
import InfografisPage from "./pages/transparansi/Infografis";
import KomoditasPage from "./pages/potensi/Komoditas";
import UmkmPage from "./pages/potensi/Umkm";
import PariwisataPage from "./pages/potensi/Pariwisata";
import PendidikanPage from "./pages/potensi/Pendidikan";
import KesehatanPage from "./pages/potensi/Kesehatan";
import EkonomiPage from "./pages/potensi/Ekonomi";
import BeritaPage from "./pages/Berita";
import BeritaDetailPage from "./pages/BeritaDetail";
import KontakPage from "./pages/Kontak";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfil from "./pages/admin/Profil";
import AdminStatistik from "./pages/admin/Statistik";
import AdminBerita from "./pages/admin/Berita";
import AdminPanduan from "./pages/admin/Panduan";
import AdminDokumen from "./pages/admin/Dokumen";
import AdminLembaga from "./pages/admin/Lembaga";
import AdminGaleri from "./pages/admin/Galeri";
import AdminKomoditas from "./pages/admin/Komoditas";
import AdminUmkm from "./pages/admin/Umkm";
import AdminApbdes from "./pages/admin/Apbdes";
import AdminPengaduan from "./pages/admin/Pengaduan";
import AdminPengaturan from "./pages/admin/Pengaturan";
import AdminSotk from "./pages/admin/Sotk";

// Auth Pages
import AdminPariwisata from "./pages/admin/Pariwisata";
import AdminPendidikan from "./pages/admin/Pendidikan";
import AdminKesehatan from "./pages/admin/Kesehatan";
import AdminEkonomi from "./pages/admin/Ekonomi";

// Auth Pages
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFoundPage from "./pages/NotFound";

export default function App() {
  // Set dynamic page title and favicon based on desa settings
  const { isLoading } = useSiteMetadata();

  // Show a completely blank layout while core database resources are loading
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50/50 flex items-center justify-center"></div>;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Profil Desa */}
        <Route path="/profil/sejarah" element={<SejarahPage />} />
        <Route path="/profil/geografis" element={<GeografisPage />} />
        <Route path="/profil/statistik" element={<StatistikPage />} />
        <Route path="/profil/dusun" element={<DusunPage />} />
        
        {/* Pemerintahan */}
        <Route path="/pemerintahan/struktur" element={<StrukturPage />} />
        <Route path="/pemerintahan/sotk" element={<SotkPage />} />
        <Route path="/pemerintahan/bpd" element={<BPDPage />} />
        <Route path="/pemerintahan/lembaga" element={<LembagaPage />} />
        
        {/* Layanan Publik */}
        <Route path="/layanan/panduan" element={<PanduanPage />} />
        <Route path="/layanan/dokumen" element={<DokumenPage />} />
        <Route path="/layanan/mandiri" element={<MandiriPage />} />
        
        {/* Transparansi */}
        <Route path="/transparansi/apbdes" element={<ApbdesPage />} />
        <Route path="/transparansi/galeri" element={<GaleriPage />} />
        <Route path="/transparansi/infografis" element={<InfografisPage />} />
        
        {/* Potensi Desa */}
        <Route path="/potensi/komoditas" element={<KomoditasPage />} />
        <Route path="/potensi/umkm" element={<UmkmPage />} />
          <Route path="/potensi/penginapan" element={<PariwisataPage type="penginapan" />} />
          <Route path="/potensi/objek-wisata" element={<PariwisataPage type="objek_wisata" />} />
          <Route path="/potensi/pendidikan" element={<PendidikanPage />} />
          <Route path="/potensi/kesehatan" element={<KesehatanPage />} />
          <Route path="/potensi/ekonomi" element={<EkonomiPage />} />
        
        {/* Berita */}
        <Route path="/berita" element={<BeritaPage />} />
        <Route path="/berita/:slug" element={<BeritaDetailPage />} />
        
        {/* Kontak */}
        <Route path="/kontak" element={<KontakPage />} />
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/profil" element={<AdminProfil />} />
        <Route path="/admin/statistik" element={<AdminStatistik />} />
        <Route path="/admin/berita" element={<AdminBerita />} />
        <Route path="/admin/panduan" element={<AdminPanduan />} />
        <Route path="/admin/dokumen" element={<AdminDokumen />} />
        <Route path="/admin/lembaga" element={<AdminLembaga />} />
        <Route path="/admin/galeri" element={<AdminGaleri />} />
        <Route path="/admin/komoditas" element={<AdminKomoditas />} />
        <Route path="/admin/umkm" element={<AdminUmkm />} />
        <Route path="/admin/pariwisata" element={<AdminPariwisata />} />
        <Route path="/admin/pendidikan" element={<AdminPendidikan />} />
        <Route path="/admin/kesehatan" element={<AdminKesehatan />} />
        <Route path="/admin/ekonomi" element={<AdminEkonomi />} />
        <Route path="/admin/apbdes" element={<AdminApbdes />} />
        <Route path="/admin/pengaduan" element={<AdminPengaduan />} />
        <Route path="/admin/pengaturan" element={<AdminPengaturan />} />
        <Route path="/admin/sotk" element={<AdminSotk />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
