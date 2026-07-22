import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DriveImage from "@/components/DriveImage";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
} from "lucide-react";

const jenisLabels: Record<string, string> = {
  puskesmas: "Puskesmas",
  poliklinik: "Poliklinik",
  rumah_sakit: "Rumah Sakit",
  apotek: "Apotek",
  klinik: "Klinik",
  posyandu: "Posyandu",
  praktik_dokter: "Praktik Dokter",
  praktik_bidan: "Praktik Bidan",
};

const jenisColors: Record<string, string> = {
  puskesmas: "bg-red-100 text-red-800",
  poliklinik: "bg-pink-100 text-pink-800",
  rumah_sakit: "bg-red-100 text-red-800",
  apotek: "bg-purple-100 text-purple-800",
  klinik: "bg-pink-100 text-pink-800",
  posyandu: "bg-rose-100 text-rose-800",
  praktik_dokter: "bg-red-100 text-red-800",
  praktik_bidan: "bg-pink-100 text-pink-800",
};

export default function KesehatanPage() {
  const { data: kesehatanList } = trpc.desa.kesehatan.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!kesehatanList) return [];
    let result = kesehatanList;

    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.namaSarana.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.alamat.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterJenis) {
      result = result.filter(
        (item) => item.jenis?.trim().toLowerCase() === filterJenis.trim().toLowerCase()
      );
    }

    return result;
  }, [kesehatanList, searchQuery, filterJenis]);

  const jenisOptions = useMemo(() => {
    if (!kesehatanList) return [];
    const jenis = new Set(kesehatanList.map((item) => item.jenis?.trim()));
    return Array.from(jenis).filter(Boolean).sort();
  }, [kesehatanList]);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-700 via-pink-600 to-red-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Kesehatan</h1>
          <p className="text-red-100 text-sm md:text-base max-w-3xl">
            Temukan informasi mengenai berbagai sarana kesehatan di desa, termasuk fasilitas pelayanan kesehatan, lokasi, dan informasi pendukung lainnya untuk memenuhi kebutuhan masyarakat.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <Input
            type="text"
            placeholder="Cari sarana kesehatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-red-700 focus:outline-none"
          />

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFilterJenis(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filterJenis === null
                  ? "bg-red-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Semua
            </button>
            {jenisOptions.map((jenis) => (
              <button
                key={jenis}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFilterJenis(jenis);
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  filterJenis === jenis
                    ? "bg-red-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {jenisLabels[jenis.toLowerCase()] || jenis}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Image */}
                  {item.fotoUrl ? (
                    <DriveImage
                      src={item.fotoUrl}
                      alt={item.namaSarana}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-red-100 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-red-300" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 flex-1">
                          {item.namaSarana}
                        </h3>
                        <span
                          className={`${jenisColors[item.jenis] || "bg-gray-100 text-gray-800"} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}
                        >
                          {jenisLabels[item.jenis] || item.jenis}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                        <span>{item.alamat}</span>
                      </div>
                    </div>

                    {/* Jam & Layanan */}
                    {(item.jamBuka || item.jamTutup) && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm bg-red-50 px-3 py-2 rounded">
                        <Clock className="w-4 h-4 text-red-600" />
                        <span>
                          {item.jamBuka && item.jamTutup
                            ? `${item.jamBuka} - ${item.jamTutup}`
                            : item.jamBuka || item.jamTutup}
                        </span>
                      </div>
                    )}

                    {/* Layanan */}
                    {item.layanan && item.layanan.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Layanan:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.layanan.slice(0, 3).map((layanan, idx) => (
                            <span
                              key={idx}
                              className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
                            >
                              {layanan}
                            </span>
                          ))}
                          {item.layanan.length > 3 && (
                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                              +{item.layanan.length - 3} lagi
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Deskripsi */}
                    {item.deskripsi && (
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {item.deskripsi}
                      </p>
                    )}

                    {/* Pimpinan & Kontak */}
                    {item.pimpinan && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Pimpinan:</span>{" "}
                        {item.pimpinan}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2 border-t">
                      {item.kontakNomor && (
                        <a
                          href={`tel:${item.kontakNomor}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white py-2 rounded font-semibold text-sm transition"
                        >
                          <Phone className="w-4 h-4" />
                          Hubungi
                        </a>
                      )}
                      {item.kontakEmail && (
                        <a
                          href={`mailto:${item.kontakEmail}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded font-semibold text-sm transition"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-20">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery || filterJenis
                  ? "Tidak ada sarana kesehatan yang cocok"
                  : "Belum ada data sarana kesehatan"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
