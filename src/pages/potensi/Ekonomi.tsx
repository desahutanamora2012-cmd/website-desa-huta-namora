import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  TrendingUp,
} from "lucide-react";
import SubmenuHeader from "@/components/SubmenuHeader";

const jenisLabels: Record<string, string> = {
  pasar: "Pasar",
  toko: "Toko",
  koperasi: "Koperasi",
  bank: "Bank",
  bpr: "BPR",
  lkm: "Lembaga Keuangan Mikro",
  bmt: "BMT",
  unit_desa: "Unit Desa",
  industri_kecil: "Industri Kecil",
  pertanian: "Pertanian",
  perternakan: "Peternakan",
  perikanan: "Perikanan",
  rumah_makan: "Rumah Makan",
  warung_makan: "Warung Makan",
  restoran: "Restoran",
};

const jenisColors: Record<string, string> = {
  pasar: "bg-amber-100 text-amber-800",
  toko: "bg-orange-100 text-orange-800",
  koperasi: "bg-green-100 text-green-800",
  bank: "bg-blue-100 text-blue-800",
  bpr: "bg-indigo-100 text-indigo-800",
  lkm: "bg-purple-100 text-purple-800",
  bmt: "bg-emerald-100 text-emerald-800",
  unit_desa: "bg-teal-100 text-teal-800",
  industri_kecil: "bg-yellow-100 text-yellow-800",
  pertanian: "bg-green-100 text-green-800",
  perternakan: "bg-amber-100 text-amber-800",
  perikanan: "bg-blue-100 text-blue-800",
  rumah_makan: "bg-red-100 text-red-800",
  warung_makan: "bg-orange-100 text-orange-800",
  restoran: "bg-rose-100 text-rose-800",
};

export default function EkonomiPage() {
  const { data: ekonomiList } = trpc.desa.ekonomi.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!ekonomiList) return [];
    let result = ekonomiList;

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
  }, [ekonomiList, searchQuery, filterJenis]);

  const jenisOptions = useMemo(() => {
    if (!ekonomiList) return [];
    const jenis = new Set(ekonomiList.map((item) => item.jenis?.trim()));
    return Array.from(jenis).filter(Boolean).sort();
  }, [ekonomiList]);

  return (
    <Layout>
      <SubmenuHeader 
        title="Potensi Ekonomi" 
        subtitle="Jelajahi berbagai sarana ekonomi di desa, mulai dari pasar, koperasi, UMKM, hingga fasilitas pendukung lainnya yang berperan dalam meningkatkan perekonomian masyarakat." 
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <Input
            type="text"
            placeholder="Cari sarana ekonomi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-amber-700 focus:outline-none"
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
                  ? "bg-amber-700 text-white"
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
                    ? "bg-amber-700 text-white"
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
                    <img
                      src={item.fotoUrl}
                      alt={item.namaSarana}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-amber-100 flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-amber-300" />
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

                    {/* Jam Operasional */}
                    {(item.jamBuka || item.jamTutup) && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm bg-amber-50 px-3 py-2 rounded">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>
                          {item.jamBuka && item.jamTutup
                            ? `${item.jamBuka} - ${item.jamTutup}`
                            : item.jamBuka || item.jamTutup}
                        </span>
                      </div>
                    )}

                    {/* Produk */}
                    {item.produk && item.produk.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Produk/Barang:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.produk.slice(0, 3).map((produk, idx) => (
                            <span
                              key={idx}
                              className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs"
                            >
                              {produk}
                            </span>
                          ))}
                          {item.produk.length > 3 && (
                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                              +{item.produk.length - 3} lagi
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

                    {/* Pimpinan */}
                    {item.pimpinan && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Pimpinan:</span>{" "}
                        {item.pimpinan}
                      </p>
                    )}

                    {/* Kontak */}
                    <div className="flex gap-3 pt-2 border-t">
                      {item.kontakNomor && (
                        <a
                          href={`tel:${item.kontakNomor}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white py-2 rounded font-semibold text-sm transition"
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
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery || filterJenis
                  ? "Tidak ada sarana ekonomi yang cocok"
                  : "Belum ada data sarana ekonomi"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
