import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Home,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  const { data: profil } = trpc.desa.profil.list.useQuery();
  const { data: temaWebsite } = trpc.desa.tema.temaWebsite.list.useQuery();

  const tema = Array.isArray(temaWebsite) ? temaWebsite[0] : temaWebsite;
  const namaDesa = profil?.nama_desa || "Desa Cantik";
  const kecamatan = profil?.kecamatan || "Kecamatan";
  const kabupaten = profil?.kabupaten || "Kabupaten";
  const provinsi = profil?.provinsi || "Provinsi";
  const kontakWa = profil?.kontak_wa || "";
  const kontakEmail = profil?.kontak_email || "";
  const kontakTelepon = profil?.kontak_telepon || "";
  const footerTeks =
    profil?.footer_teks ||
    "Hasil Pembinaan Desa Cantik (Desa Cinta Statistik) BPS Kabupaten Samosir";
  const footerLogoUrl = profil?.footer_logo_url || (tema as any)?.logoUrl || (tema as any)?.logoKecilUrl || "";
  const medsos = profil?.medsos
    ? JSON.parse(profil.medsos)
    : { facebook: "", instagram: "", youtube: "" };

  return (
    <footer className="bg-emerald-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Kolom 1: Profil Desa */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-emerald-700 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{namaDesa}</h3>
                <p className="text-[10px] text-emerald-300">
                  Website Resmi Pemerintah Desa
                </p>
              </div>
            </div>
            <p className="text-sm text-emerald-200 leading-relaxed mb-4">
              Website ini merupakan portal resmi Pemerintah {namaDesa} yang
              menyediakan informasi tentang profil desa, pelayanan publik, dan
              transparansi pemerintahan.
            </p>
          </div>

          {/* Kolom 2: Menu Cepat */}
          <div>
            <h3 className="font-semibold text-sm mb-4 border-b border-emerald-700 pb-2">
              Menu Cepat
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Beranda", path: "/" },
                { label: "Profil Desa", path: "/profil/sejarah" },
                { label: "Pemerintahan", path: "/pemerintahan/struktur" },
                { label: "Layanan Publik", path: "/layanan/panduan" },
                { label: "Berita Desa", path: "/berita" },
                { label: "Potensi UMKM", path: "/potensi/umkm" },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-emerald-200 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div>
            <h3 className="font-semibold text-sm mb-4 border-b border-emerald-700 pb-2">
              Kontak Kami
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-emerald-200">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Kantor {namaDesa}, {kecamatan}, {kabupaten}, {provinsi}
                </span>
              </li>
              {kontakTelepon && (
                <li className="flex items-center gap-2 text-sm text-emerald-200">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{kontakTelepon}</span>
                </li>
              )}
              {kontakWa && (
                <li className="flex items-center gap-2 text-sm text-emerald-200">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>WA: {kontakWa}</span>
                </li>
              )}
              {kontakEmail && (
                <li className="flex items-center gap-2 text-sm text-emerald-200">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>{kontakEmail}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Kolom 4: Media Sosial */}
          <div>
            <h3 className="font-semibold text-sm mb-4 border-b border-emerald-700 pb-2">
              Media Sosial
            </h3>
            <div className="space-y-3">
              {medsos.facebook && (
                <a
                  href={`https://facebook.com/${medsos.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-200 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  <span>{medsos.facebook}</span>
                </a>
              )}
              {medsos.instagram && (
                <a
                  href={`https://instagram.com/${medsos.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-200 hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{medsos.instagram}</span>
                </a>
              )}
              {medsos.youtube && (
                <a
                  href={`https://youtube.com/${medsos.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-200 hover:text-white transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  <span>{medsos.youtube}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attribution Bar */}
      <div className="bg-emerald-950 border-t border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-3">
            {footerLogoUrl ? (
              <img
                key={footerLogoUrl || "footer-logo"}
                src={footerLogoUrl}
                alt="Logo BPS"
                className="h-9 object-contain mx-auto md:mx-0"
              />
            ) : (
              <div className="h-9 w-9 bg-emerald-800 rounded flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <span className="text-[10px] font-bold text-emerald-300">BPS</span>
              </div>
            )}

            <p className="text-[11px] text-emerald-300 text-center">
              {footerTeks}
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-center text-[11px] text-emerald-400">
            &copy; {new Date().getFullYear()} Pemerintah {namaDesa}. Semua Hak
            Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
