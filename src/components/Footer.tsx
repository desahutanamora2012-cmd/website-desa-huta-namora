import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import DriveImage from "@/components/DriveImage";
import {
  Home,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  MessageCircle,
  Music2,
  Send,
  Link as LinkIcon,
  ChevronRight,
} from "lucide-react";

function getMedsosIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "facebook": return <Facebook className="w-4 h-4" />;
    case "instagram": return <Instagram className="w-4 h-4" />;
    case "youtube": return <Youtube className="w-4 h-4" />;
    case "twitter": return <Twitter className="w-4 h-4" />;
    case "linkedin": return <Linkedin className="w-4 h-4" />;
    case "whatsapp": return <MessageCircle className="w-4 h-4" />;
    case "telegram": return <Send className="w-4 h-4" />;
    case "tiktok": return <Music2 className="w-4 h-4" />;
    default: return <LinkIcon className="w-4 h-4" />;
  }
}

function getMedsosHoverBg(platform: string) {
  switch (platform.toLowerCase()) {
    case "facebook": return "bg-[#1877F2]";
    case "instagram": return "bg-[#E4405F]";
    case "youtube": return "bg-[#FF0000]";
    case "twitter": return "bg-[#1DA1F2]";
    case "linkedin": return "bg-[#0A66C2]";
    case "whatsapp": return "bg-[#25D366]";
    case "telegram": return "bg-[#0088cc]";
    case "tiktok": return "bg-black";
    default: return "bg-gray-600";
  }
}

function formatMedsosUrl(platform: string, url: string) {
  if (!url.startsWith("http")) {
    switch (platform.toLowerCase()) {
      case "facebook": return `https://facebook.com/${url}`;
      case "instagram": return `https://instagram.com/${url.replace("@", "")}`;
      case "youtube": return `https://youtube.com/${url}`;
      case "twitter": return `https://twitter.com/${url.replace("@", "")}`;
      default: return `https://${url}`;
    }
  }
  return url;
}

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
  const medsosRaw = profil?.medsos || "{}";
  let medsos: Record<string, string> = {};
  try {
    medsos = JSON.parse(medsosRaw);
  } catch (e) {
    medsos = {};
  }
  const medsosEntries = Object.entries(medsos).filter(([_, url]) => url);

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Kolom 1: Profil Desa */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <Home className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">{namaDesa}</h3>
                <p className="text-[9px] text-white/70 font-semibold uppercase tracking-wider">
                  Pemerintah Desa
                </p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-medium pr-4">
              Website ini merupakan portal resmi Pemerintah {namaDesa} yang
              menyediakan informasi tentang profil desa, pelayanan publik, dan
              transparansi pemerintahan.
            </p>
          </div>

          {/* Kolom 2: Kontak */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-white tracking-wide">
              Kontak Kami
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 text-xs text-white/70 font-medium leading-relaxed">
                <div className="mt-0.5 bg-white/10 p-1.5 rounded-md shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                <span>
                  Kantor {namaDesa}, {kecamatan},<br/>{kabupaten}, {provinsi}
                </span>
              </li>
              {kontakTelepon && (
                <li className="flex items-center gap-2.5 text-xs text-white/70 font-medium">
                  <div className="bg-white/10 p-1.5 rounded-md shrink-0">
                    <Phone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>{kontakTelepon}</span>
                </li>
              )}
              {kontakWa && (
                <li className="flex items-center gap-2.5 text-xs text-white/70 font-medium">
                  <div className="bg-white/10 p-1.5 rounded-md shrink-0">
                    <Phone className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>WA: {kontakWa}</span>
                </li>
              )}
              {kontakEmail && (
                <li className="flex items-center gap-2.5 text-xs text-white/70 font-medium">
                  <div className="bg-white/10 p-1.5 rounded-md shrink-0">
                    <Mail className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>{kontakEmail}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Kolom 3: Media Sosial */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-white tracking-wide">
              Media Sosial
            </h3>
            <div className="flex flex-wrap gap-2">
              {medsosEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={formatMedsosUrl(platform, url as string)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden flex items-center justify-center w-8 h-8 bg-white/10 rounded-full text-white/80 hover:text-white hover:-translate-y-1 transition-all group"
                  title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                >
                  <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${getMedsosHoverBg(platform)}`} />
                  <div className="relative z-10 scale-90">
                    {getMedsosIcon(platform)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attribution Bar */}
      <div className="border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-4">
            {footerLogoUrl ? (
              <DriveImage
                key={footerLogoUrl || "footer-logo"}
                src={footerLogoUrl}
                alt="Logo BPS"
                className="h-8 object-contain mx-auto md:mx-0 opacity-90"
              />
            ) : (
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <span className="text-[9px] font-extrabold text-white">BPS</span>
              </div>
            )}

            <p className="text-[10px] sm:text-xs text-white/70 text-center font-medium">
              {footerTeks}
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-black/40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-center text-[10px] sm:text-xs text-white/50 font-medium">
            &copy; {new Date().getFullYear()} Pemerintah {namaDesa}. Semua Hak
            Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
