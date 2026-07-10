import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import BackgroundCarousel from "@/components/BackgroundCarousel";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MapPin,
  Building2,
  TrendingUp,
  Newspaper,
  ArrowRight,
  Calendar,
} from "lucide-react";

export default function Home() {
  const { data: profil } = trpc.desa.profil.list.useQuery();
  const { data: statistik } = trpc.desa.statistik.getLatest.useQuery();
  const { data: beritaList } = trpc.desa.berita.list.useQuery({
    status: "published",
    limit: 4,
  });
  const { data: lembagaList } = trpc.desa.lembaga.list.useQuery();
  const { data: galeriList } = trpc.desa.galeri.list.useQuery();
  const { data: umkmList } = trpc.desa.umkm.list.useQuery();

  const namaDesa = profil?.nama_desa || "Desa Cantik";
  const visi = profil?.visi || "";

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <BackgroundCarousel />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent z-0 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-32 lg:pt-24 lg:pb-40 w-full text-center sm:text-left">
          <div className="max-w-2xl mx-auto sm:mx-0">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-xl text-white">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              Website Resmi Pemerintah Desa
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.1] tracking-tight text-white drop-shadow-lg">
              Selamat Datang di<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">{namaDesa}</span>
            </h1>
            <p className="text-base lg:text-lg text-white/90 mb-8 leading-relaxed font-medium max-w-xl mx-auto sm:mx-0 drop-shadow">
              {visi}
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="-mt-24 relative z-20 max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Penduduk */}
          <Card className="relative overflow-hidden border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:bg-white rounded-2xl group">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />
            <CardContent className="relative p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none mb-1">
                    {statistik?.totalPenduduk?.toLocaleString("id-ID") || "0"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Penduduk
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Luas Wilayah */}
          <Card className="relative overflow-hidden border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:bg-white rounded-2xl group">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors" />
            <CardContent className="relative p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none mb-1">
                    {statistik?.luasWilayah || "0"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Ha Wilayah
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kepala Keluarga */}
          <Card className="relative overflow-hidden border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:bg-white rounded-2xl group">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-colors" />
            <CardContent className="relative p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none mb-1">
                    {statistik?.totalKK?.toLocaleString("id-ID") || "0"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Kepala Keluarga
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dusun */}
          <Card className="relative overflow-hidden border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:bg-white rounded-2xl group">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-purple-500/5 blur-xl group-hover:bg-purple-500/10 transition-colors" />
            <CardContent className="relative p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 shrink-0 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none mb-1">
                    {statistik?.jumlahDusun || "0"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Jumlah Dusun
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Berita (Kabar & Pengumuman) */}
      <section className="py-20 bg-transparent relative z-10 -mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Kabar Terbaru
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                Informasi dan pengumuman resmi dari pemerintah desa
              </p>
            </div>
            <Link to="/berita">
              <Button
                variant="outline"
                className="hidden sm:flex border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl px-6 font-semibold transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {beritaList && beritaList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {beritaList.map((berita, index) => (
                <Link key={berita.id} to={`/berita/${berita.slug}`} className={`group ${index < 2 ? 'md:col-span-2 lg:col-span-2' : 'lg:col-span-1'}`}>
                  <Card className="border-0 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all cursor-pointer h-full overflow-hidden rounded-2xl bg-white relative">
                    <div className={`relative overflow-hidden ${index < 2 ? 'h-64' : 'h-48'}`}>
                      <img
                        src={
                          berita.gambarSampul ||
                          "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800"
                        }
                        alt={berita.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                      
                      <div className="absolute top-4 left-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm backdrop-blur-md border border-white/20 ${
                            berita.kategori === "pengumuman"
                              ? "bg-orange-500/90 text-white"
                              : berita.kategori === "berita"
                                ? "bg-blue-500/90 text-white"
                                : "bg-primary/90 text-white"
                          }`}
                        >
                          {berita.kategori === "kabar_desa" ? "Kabar Desa" : berita.kategori === "pengumuman" ? "Pengumuman" : "Berita"}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white/80 mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium tracking-wide uppercase">
                            {formatDate(berita.tanggalPublish)}
                          </span>
                        </div>
                        <h3 className={`font-bold text-white leading-snug group-hover:text-primary-100 transition-colors ${index < 2 ? 'text-xl line-clamp-2' : 'text-base line-clamp-2'}`}>
                          {berita.judul}
                        </h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-gray-300 bg-white shadow-sm rounded-2xl">
              <CardContent className="p-10 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                  <Newspaper className="h-8 w-8 text-primary/40" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Belum ada publikasi</h3>
                <p className="text-gray-500 mt-2 max-w-md">Silakan tambahkan data berita atau pengumuman melalui panel Admin agar tampil di beranda.</p>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 sm:hidden">
            <Link to="/berita">
              <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Lihat Semua Berita
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery & UMKM Combined Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Gallery Preview */}
          {galeriList && galeriList.length > 0 && (
            <div className="mb-24">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Galeri Visual</h2>
                  <p className="text-gray-500 mt-2 font-medium">Dokumentasi momen dan kegiatan desa</p>
                </div>
                <Link to="/transparansi/galeri">
                  <Button variant="outline" className="hidden sm:flex rounded-xl font-semibold hover:bg-primary hover:text-white border-gray-200">
                    Lihat Semua
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galeriList.slice(0, 4).map((item, index) => (
                  <div
                    key={item.id}
                    className={`relative group overflow-hidden rounded-2xl ${index === 0 || index === 3 ? 'aspect-square md:aspect-[3/4]' : 'aspect-square md:aspect-square'}`}
                  >
                    <img
                      src={item.gambarUrl}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-bold leading-tight">
                        {item.judul}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UMKM Preview */}
          {umkmList && umkmList.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Produk Unggulan</h2>
                  <p className="text-gray-500 mt-2 font-medium">Karya dan kreasi UMKM lokal</p>
                </div>
                <Link to="/potensi/umkm">
                  <Button variant="outline" className="hidden sm:flex rounded-xl font-semibold hover:bg-primary hover:text-white border-gray-200">
                    Lihat Katalog
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {umkmList.map((item) => (
                  <Card
                    key={item.id}
                    className="border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden rounded-2xl group bg-gray-50/50"
                  >
                    <div className="h-48 overflow-hidden relative p-3">
                      <img
                        src={
                          item.fotoUrl ||
                          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400"
                        }
                        alt={item.namaProduk}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-5 pt-2">
                      <span className="text-[10px] px-2.5 py-1 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">
                        {item.kategori}
                      </span>
                      <h3 className="font-bold text-base text-gray-900 mt-3 group-hover:text-primary transition-colors">
                        {item.namaProduk}
                      </h3>
                      {item.namaUsaha && (
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                          {item.namaUsaha}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lembaga */}
      {lembagaList && lembagaList.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Lembaga Kemasyarakatan
              </h2>
              <p className="text-gray-500 mt-3 font-medium max-w-2xl mx-auto">
                Organisasi yang mengabdi dan berkolaborasi untuk memajukan kesejahteraan masyarakat desa.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lembagaList.slice(0, 3).map((item) => (
                <Card
                  key={item.id}
                  className="border-0 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all rounded-2xl bg-white group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      {item.fotoUrl ? (
                        <img
                          src={item.fotoUrl}
                          alt={item.nama}
                          className="h-16 w-16 rounded-2xl object-cover shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Users className="h-7 w-7 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight mb-2">
                          {item.nama}
                        </h3>
                        {item.ketua && (
                          <p className="text-sm text-gray-500 font-medium">
                            <span className="text-gray-400 text-xs uppercase tracking-wider block mb-0.5">Ketua</span>
                            {item.ketua}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/pemerintahan/lembaga">
                <Button variant="outline" className="rounded-xl px-8 font-semibold border-gray-300 hover:bg-gray-100">
                  Jelajahi Semua Lembaga
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
