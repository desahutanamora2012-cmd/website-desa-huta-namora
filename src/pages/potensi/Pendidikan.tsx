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
  Users,
  Award,
  Calendar,
  BookOpen,
} from "lucide-react";

const jenjangLabels: Record<string, string> = {
  paud: "PAUD",
  tk: "TK",
  sd: "SD",
  smp: "SMP",
  sma: "SMA",
  smk: "SMK",
  d1: "Diploma I",
  d2: "Diploma II",
  d3: "Diploma III",
  d4: "Diploma IV",
  s1: "Sarjana (S1)",
  s2: "Magister (S2)",
  s3: "Doktor (S3)",
};

const jenjangOrder = [
  "paud",
  "tk",
  "sd",
  "smp",
  "sma",
  "smk",
  "d1",
  "d2",
  "d3",
  "d4",
  "s1",
  "s2",
  "s3",
];

export default function PendidikanPage() {
  const { data: pendidikanList } = trpc.desa.pendidikan.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenjang, setFilterJenjang] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!pendidikanList) return [];
    let result = pendidikanList;

    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.namaSarana.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.alamat.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterJenjang) {
      result = result.filter(
        (item) => item.jenjang?.trim().toLowerCase() === filterJenjang.trim().toLowerCase()
      );
    }

    // Sort by jenjangOrder
    return result.sort((a, b) => {
      return jenjangOrder.indexOf(a.jenjang?.trim().toLowerCase()) - jenjangOrder.indexOf(b.jenjang?.trim().toLowerCase());
    });
  }, [pendidikanList, searchQuery, filterJenjang]);

  const jenjangOptions = useMemo(() => {
    if (!pendidikanList) return [];
    const jenjangs = new Set(pendidikanList.map((item) => item.jenjang?.trim()));
    return Array.from(jenjangs).filter(Boolean).sort((a, b) => jenjangOrder.indexOf(a.toLowerCase()) - jenjangOrder.indexOf(b.toLowerCase()));
  }, [pendidikanList]);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-cyan-600 to-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Pendidikan</h1>
          <p className="text-blue-100 text-sm md:text-base max-w-3xl">
            Temukan berbagai fasilitas pendidikan yang tersedia di desa kami. Informasi ini mencakup lokasi, jenjang pendidikan, dan data pendukung lainnya sebagai referensi bagi masyarakat dan pengunjung.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <Input
            type="text"
            placeholder="Cari sarana pendidikan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-700 focus:outline-none"
          />

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFilterJenjang(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filterJenjang === null
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Semua
            </button>
            {jenjangOptions.map((jenjang) => (
              <button
                key={jenjang}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFilterJenjang(jenjang);
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  filterJenjang === jenjang
                    ? "bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {jenjangLabels[jenjang.toLowerCase()] || jenjang}
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
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-blue-300" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 flex-1">
                          {item.namaSarana}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          {jenjangLabels[item.jenjang] || item.jenjang}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                        <span>{item.alamat}</span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
                      {item.jumlahGuru !== null && item.jumlahGuru !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <div className="text-sm">
                            <p className="text-gray-600">Guru</p>
                            <p className="font-semibold text-gray-900">
                              {item.jumlahGuru}
                            </p>
                          </div>
                        </div>
                      )}
                      {item.jumlahSiswa !== null && item.jumlahSiswa !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-600" />
                          <div className="text-sm">
                            <p className="text-gray-600">Siswa</p>
                            <p className="font-semibold text-gray-900">
                              {item.jumlahSiswa}
                            </p>
                          </div>
                        </div>
                      )}
                      {item.tahunBerdiri && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <div className="text-sm">
                            <p className="text-gray-600">Berdiri</p>
                            <p className="font-semibold text-gray-900">
                              {item.tahunBerdiri}
                            </p>
                          </div>
                        </div>
                      )}
                      {item.statusAkreditasi && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <div className="text-sm">
                            <p className="text-gray-600">Akreditasi</p>
                            <p className="font-semibold text-gray-900">
                              {item.statusAkreditasi}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deskripsi */}
                    {item.deskripsi && (
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {item.deskripsi}
                      </p>
                    )}

                    {/* Kontak */}
                    <div className="space-y-2">
                      {item.kepala && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Kepala:</span>{" "}
                          {item.kepala}
                        </p>
                      )}
                      <div className="flex gap-3 pt-2">
                        {item.kontakNomor && (
                          <a
                            href={`tel:${item.kontakNomor}`}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                          >
                            <Phone className="w-4 h-4" />
                            Hubungi
                          </a>
                        )}
                        {item.kontakEmail && (
                          <a
                            href={`mailto:${item.kontakEmail}`}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery || filterJenjang
                  ? "Tidak ada sarana pendidikan yang cocok"
                  : "Belum ada data sarana pendidikan"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
