import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserCircle,
  GraduationCap,
  Building2Icon,
  BarChart3,
  Download,
  Hospital,
  Store,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { downloadExcel } from "@/lib/utils";

const PIE_COLORS = ["#059669", "#0891b2", "#d97706", "#dc2626", "#7c3aed"];

export default function StatistikPage() {
  const { data: statistik } = trpc.desa.statistik.getLatest.useQuery();

  const dataPendidikan = statistik?.dataPendidikan;
  const dataAngkatanKerja = statistik?.dataAngkatanKerja;
  const dataUsia = statistik?.dataUsia;

  const infrastrukturPendidikan = statistik?.infrastrukturPendidikan || {};
  const infrastrukturKesehatan = statistik?.infrastrukturKesehatan || {};
  const infrastrukturEkonomi = statistik?.infrastrukturEkonomi || {};

  const tahunKependudukan = statistik?.tahun || new Date().getFullYear();
  const tahunPendidikan = infrastrukturPendidikan.tahun || tahunKependudukan;
  const tahunKesehatan = infrastrukturKesehatan.tahun || tahunKependudukan;
  const tahunEkonomi = infrastrukturEkonomi.tahun || tahunKependudukan;

  // Tab 1 Data Setup
  const pyramidData = dataUsia
    ? [
        { usia: "0-4", laki: dataUsia.range0_4 / 2, perempuan: dataUsia.range0_4 / 2 },
        { usia: "5-9", laki: dataUsia.range5_9 / 2, perempuan: dataUsia.range5_9 / 2 },
        { usia: "10-14", laki: dataUsia.range10_14 / 2, perempuan: dataUsia.range10_14 / 2 },
        { usia: "15-19", laki: dataUsia.range15_19 / 2, perempuan: dataUsia.range15_19 / 2 },
        { usia: "20-24", laki: dataUsia.range20_24 / 2, perempuan: dataUsia.range20_24 / 2 },
        { usia: "25-29", laki: dataUsia.range25_29 / 2, perempuan: dataUsia.range25_29 / 2 },
        { usia: "30-34", laki: dataUsia.range30_34 / 2, perempuan: dataUsia.range30_34 / 2 },
        { usia: "35-39", laki: dataUsia.range35_39 / 2, perempuan: dataUsia.range35_39 / 2 },
        { usia: "40-44", laki: dataUsia.range40_44 / 2, perempuan: dataUsia.range40_44 / 2 },
        { usia: "45-49", laki: dataUsia.range45_49 / 2, perempuan: dataUsia.range45_49 / 2 },
        { usia: "50-54", laki: dataUsia.range50_54 / 2, perempuan: dataUsia.range50_54 / 2 },
        { usia: "55-59", laki: dataUsia.range55_59 / 2, perempuan: dataUsia.range55_59 / 2 },
        { usia: "60-64", laki: dataUsia.range60_64 / 2, perempuan: dataUsia.range60_64 / 2 },
        { usia: "65+", laki: dataUsia.range65_plus / 2, perempuan: dataUsia.range65_plus / 2 },
      ]
    : [];

  const pendidikanChart = dataPendidikan
    ? [
        { name: "Tidak Sekolah", value: dataPendidikan.tidakSekolah },
        { name: "SD", value: dataPendidikan.sd },
        { name: "SMP", value: dataPendidikan.smp },
        { name: "SMA", value: dataPendidikan.sma },
        { name: "Diploma", value: dataPendidikan.diploma },
        { name: "Sarjana", value: dataPendidikan.sarjana },
      ]
    : [];

  const angkatanKerjaChart = dataAngkatanKerja
    ? [
        { name: "Bekerja", value: dataAngkatanKerja.bekerja },
        { name: "Pengangguran", value: dataAngkatanKerja.pengangguran },
        { name: "Tidak Bekerja", value: dataAngkatanKerja.tidakBekerja },
      ]
    : [];

  const usiaDistribution = dataUsia
    ? [
        { name: "Anak (0-14)", value: dataUsia.range0_4 + dataUsia.range5_9 + dataUsia.range10_14 },
        { name: "Remaja (15-24)", value: dataUsia.range15_19 + dataUsia.range20_24 },
        { name: "Dewasa (25-54)", value: dataUsia.range25_29 + dataUsia.range30_34 + dataUsia.range35_39 + dataUsia.range40_44 + dataUsia.range45_49 + dataUsia.range50_54 },
        { name: "Lansia (55+)", value: dataUsia.range55_59 + dataUsia.range60_64 + dataUsia.range65_plus },
      ]
    : [];

  // Handlers for Excel download
  const handleDownloadKependudukan = () => {
    if (!statistik) return;
    
    // We build a multi-sheet object
    const sheetsData: Record<string, any[]> = {};
    
    // Sheet 1: Umum
    sheetsData["Umum"] = [
      {
        Tahun: statistik.tahun,
        "Total Penduduk": statistik.totalPenduduk,
        "Total KK": statistik.totalKK,
        "Laki-laki": statistik.totalLakiLaki,
        Perempuan: statistik.totalPerempuan,
        "Luas Wilayah": statistik.luasWilayah,
        "Jumlah Dusun": statistik.jumlahDusun,
        "Jumlah RT": statistik.jumlahRT,
        "Jumlah RW": statistik.jumlahRW,
      },
    ];

    // Sheet 2: Pendidikan
    if (dataPendidikan) {
      sheetsData["Pendidikan"] = [
        { Kategori: "Tidak Sekolah", Jumlah: dataPendidikan.tidakSekolah },
        { Kategori: "SD", Jumlah: dataPendidikan.sd },
        { Kategori: "SMP", Jumlah: dataPendidikan.smp },
        { Kategori: "SMA", Jumlah: dataPendidikan.sma },
        { Kategori: "Diploma", Jumlah: dataPendidikan.diploma },
        { Kategori: "Sarjana", Jumlah: dataPendidikan.sarjana },
      ];
    }

    // Sheet 3: Angkatan Kerja
    if (dataAngkatanKerja) {
      sheetsData["Angkatan Kerja"] = [
        { Kategori: "Bekerja", Jumlah: dataAngkatanKerja.bekerja },
        { Kategori: "Pengangguran", Jumlah: dataAngkatanKerja.pengangguran },
        { Kategori: "Tidak Bekerja", Jumlah: dataAngkatanKerja.tidakBekerja },
      ];
    }

    // Sheet 4: Kelompok Usia
    if (dataUsia) {
      sheetsData["Kelompok Usia"] = [
        { "Kelompok Usia": "0-4 Tahun", Jumlah: dataUsia.range0_4 },
        { "Kelompok Usia": "5-9 Tahun", Jumlah: dataUsia.range5_9 },
        { "Kelompok Usia": "10-14 Tahun", Jumlah: dataUsia.range10_14 },
        { "Kelompok Usia": "15-19 Tahun", Jumlah: dataUsia.range15_19 },
        { "Kelompok Usia": "20-24 Tahun", Jumlah: dataUsia.range20_24 },
        { "Kelompok Usia": "25-29 Tahun", Jumlah: dataUsia.range25_29 },
        { "Kelompok Usia": "30-34 Tahun", Jumlah: dataUsia.range30_34 },
        { "Kelompok Usia": "35-39 Tahun", Jumlah: dataUsia.range35_39 },
        { "Kelompok Usia": "40-44 Tahun", Jumlah: dataUsia.range40_44 },
        { "Kelompok Usia": "45-49 Tahun", Jumlah: dataUsia.range45_49 },
        { "Kelompok Usia": "50-54 Tahun", Jumlah: dataUsia.range50_54 },
        { "Kelompok Usia": "55-59 Tahun", Jumlah: dataUsia.range55_59 },
        { "Kelompok Usia": "60-64 Tahun", Jumlah: dataUsia.range60_64 },
        { "Kelompok Usia": "65+ Tahun", Jumlah: dataUsia.range65_plus },
      ];
    }

    downloadExcel(sheetsData, `Statistik_Kependudukan_${tahunKependudukan}`, `Statistik Kependudukan Desa Tahun ${tahunKependudukan}`);
  };

  const handleDownloadPendidikan = () => {
    if (!statistik) return;
    const data = [
      {
        Tahun: tahunPendidikan,
        TK: infrastrukturPendidikan.tk || 0,
        "RA/BA": infrastrukturPendidikan.ra_ba || 0,
        SD: infrastrukturPendidikan.sd || 0,
        MI: infrastrukturPendidikan.mi || 0,
        SMP: infrastrukturPendidikan.smp || 0,
        MTs: infrastrukturPendidikan.mts || 0,
        SMA: infrastrukturPendidikan.sma || 0,
        MA: infrastrukturPendidikan.ma || 0,
        SMK: infrastrukturPendidikan.smk || 0,
        "Perguruan Tinggi": infrastrukturPendidikan.perguruanTinggi || 0,
      },
    ];
    downloadExcel(data, `Infrastruktur_Pendidikan_${tahunPendidikan}`, `Statistik Infrastruktur Pendidikan Tahun ${tahunPendidikan}`);
  };

  const handleDownloadKesehatan = () => {
    if (!statistik) return;
    const data = [
      {
        Tahun: tahunKesehatan,
        "Rumah Sakit": infrastrukturKesehatan.rumahSakit || 0,
        "Klinik Utama": infrastrukturKesehatan.klinikUtama || 0,
        "Balai Kesehatan": infrastrukturKesehatan.balaiKesehatan || 0,
        "Puskesmas Inap": infrastrukturKesehatan.puskesmasInap || 0,
        "Puskesmas Non-Inap": infrastrukturKesehatan.puskesmasNonInap || 0,
        "Puskesmas Pembantu": infrastrukturKesehatan.puskesmasPembantu || 0,
        "Klinik Pratama": infrastrukturKesehatan.klinikPratama || 0,
        "Praktik Dokter": infrastrukturKesehatan.praktikDokter || 0,
        "Praktik Bidan": infrastrukturKesehatan.praktikBidan || 0,
        Poskesdes: infrastrukturKesehatan.poskesdes || 0,
        Polindes: infrastrukturKesehatan.polindes || 0,
        Apotek: infrastrukturKesehatan.apotek || 0,
        "Toko Obat": infrastrukturKesehatan.tokoObat || 0,
        Posyandu: infrastrukturKesehatan.posyandu || 0,
      },
    ];
    downloadExcel(data, `Infrastruktur_Kesehatan_${tahunKesehatan}`, `Statistik Infrastruktur Kesehatan Tahun ${tahunKesehatan}`);
  };

  const handleDownloadEkonomi = () => {
    if (!statistik) return;
    const data = [
      {
        Tahun: tahunEkonomi,
        Pertokoan: infrastrukturEkonomi.pertokoan || 0,
        "Pasar Permanen": infrastrukturEkonomi.pasarPermanen || 0,
        "Pasar Semi Permanen": infrastrukturEkonomi.pasarSemiPermanen || 0,
        "Pasar Tanpa Bangunan": infrastrukturEkonomi.pasarTanpaBangunan || 0,
        Minimarket: infrastrukturEkonomi.minimarket || 0,
        Restoran: infrastrukturEkonomi.restoran || 0,
        "Warung Makanan": infrastrukturEkonomi.warungMakanan || 0,
        Hotel: infrastrukturEkonomi.hotel || 0,
        Penginapan: infrastrukturEkonomi.penginapan || 0,
        "Toko Kelontong": infrastrukturEkonomi.tokoKelontong || 0,
      },
    ];
    downloadExcel(data, `Infrastruktur_Ekonomi_${tahunEkonomi}`, `Statistik Infrastruktur Ekonomi Tahun ${tahunEkonomi}`);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Statistik Desa</h1>
          <p className="text-emerald-100 mt-2">
            Data kependudukan dan sarana prasarana desa secara komprehensif
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <Tabs defaultValue="kependudukan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-emerald-50 h-auto gap-2 p-2 rounded-xl">
            <TabsTrigger value="kependudukan" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-2">
              Kependudukan
            </TabsTrigger>
            <TabsTrigger value="pendidikan" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-2">
              Infrastruktur Pendidikan
            </TabsTrigger>
            <TabsTrigger value="kesehatan" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-2">
              Infrastruktur Kesehatan
            </TabsTrigger>
            <TabsTrigger value="ekonomi" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-2">
              Infrastruktur Ekonomi
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Kependudukan */}
          <TabsContent value="kependudukan" className="mt-6 space-y-6 animate-in fade-in-50">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">Statistik Kependudukan Desa Tahun {tahunKependudukan}</h2>
              <Button onClick={handleDownloadKependudukan} variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Download className="w-4 h-4" /> Unduh Excel
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistik?.totalPenduduk?.toLocaleString("id-ID") || "0"}
                      </p>
                      <p className="text-xs text-gray-500">Total Penduduk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistik?.totalLakiLaki?.toLocaleString("id-ID") || "0"}
                      </p>
                      <p className="text-xs text-gray-500">Laki-laki</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-pink-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistik?.totalPerempuan?.toLocaleString("id-ID") || "0"}
                      </p>
                      <p className="text-xs text-gray-500">Perempuan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Building2Icon className="h-5 w-5 text-orange-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistik?.totalKK?.toLocaleString("id-ID") || "0"}
                      </p>
                      <p className="text-xs text-gray-500">Kepala Keluarga</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {pyramidData.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-700" />
                    Piramida Penduduk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={pyramidData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="usia" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="laki" name="Laki-laki" fill="#0891b2" />
                      <Bar dataKey="perempuan" name="Perempuan" fill="#db2777" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {pendidikanChart.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-emerald-700" />
                      Tingkat Pendidikan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pendidikanChart} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pendidikanChart.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend fontSize={12} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {usiaDistribution.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-emerald-700" />
                      Distribusi Usia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={usiaDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {usiaDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {angkatanKerjaChart.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      Angkatan Kerja
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={angkatanKerjaChart} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                          {angkatanKerjaChart.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend fontSize={12} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: Pendidikan */}
          <TabsContent value="pendidikan" className="mt-6 animate-in fade-in-50">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Statistik Infrastruktur Pendidikan Tahun {tahunPendidikan}</h2>
              <Button onClick={handleDownloadPendidikan} variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Download className="w-4 h-4" /> Unduh Excel
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Taman Kanak (TK)", val: infrastrukturPendidikan.tk },
                { label: "RA/BA", val: infrastrukturPendidikan.ra_ba },
                { label: "Sekolah Dasar (SD)", val: infrastrukturPendidikan.sd },
                { label: "Madrasah Ibtidaiyah", val: infrastrukturPendidikan.mi },
                { label: "SMP", val: infrastrukturPendidikan.smp },
                { label: "MTs", val: infrastrukturPendidikan.mts },
                { label: "SMA", val: infrastrukturPendidikan.sma },
                { label: "MA", val: infrastrukturPendidikan.ma },
                { label: "SMK", val: infrastrukturPendidikan.smk },
                { label: "Perguruan Tinggi", val: infrastrukturPendidikan.perguruanTinggi },
              ].map((item, i) => (
                <Card key={i} className="border-0 shadow-sm text-center">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{item.val || 0}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: Kesehatan */}
          <TabsContent value="kesehatan" className="mt-6 animate-in fade-in-50">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Statistik Infrastruktur Kesehatan Tahun {tahunKesehatan}</h2>
              <Button onClick={handleDownloadKesehatan} variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Download className="w-4 h-4" /> Unduh Excel
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { label: "Rumah Sakit", val: infrastrukturKesehatan.rumahSakit },
                { label: "Klinik Utama", val: infrastrukturKesehatan.klinikUtama },
                { label: "Balai Kesehatan", val: infrastrukturKesehatan.balaiKesehatan },
                { label: "Puskesmas Rawat Inap", val: infrastrukturKesehatan.puskesmasInap },
                { label: "Puskesmas Non-Inap", val: infrastrukturKesehatan.puskesmasNonInap },
                { label: "Puskesmas Pembantu", val: infrastrukturKesehatan.puskesmasPembantu },
                { label: "Klinik Pratama", val: infrastrukturKesehatan.klinikPratama },
                { label: "Praktik Dokter", val: infrastrukturKesehatan.praktikDokter },
                { label: "Praktik Bidan", val: infrastrukturKesehatan.praktikBidan },
                { label: "Poskesdes", val: infrastrukturKesehatan.poskesdes },
                { label: "Polindes", val: infrastrukturKesehatan.polindes },
                { label: "Apotek", val: infrastrukturKesehatan.apotek },
                { label: "Toko Obat/Jamu", val: infrastrukturKesehatan.tokoObat },
                { label: "Posyandu Aktif", val: infrastrukturKesehatan.posyandu },
              ].map((item, i) => (
                <Card key={i} className="border-0 shadow-sm text-center">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-pink-50 rounded-full flex items-center justify-center mb-3">
                      <Hospital className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{item.val || 0}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: Ekonomi */}
          <TabsContent value="ekonomi" className="mt-6 animate-in fade-in-50">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Statistik Infrastruktur Ekonomi Tahun {tahunEkonomi}</h2>
              <Button onClick={handleDownloadEkonomi} variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Download className="w-4 h-4" /> Unduh Excel
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { label: "Kelompok Pertokoan", val: infrastrukturEkonomi.pertokoan },
                { label: "Pasar Permanen", val: infrastrukturEkonomi.pasarPermanen },
                { label: "Pasar Semi Permanen", val: infrastrukturEkonomi.pasarSemiPermanen },
                { label: "Pasar Tanpa Bangunan", val: infrastrukturEkonomi.pasarTanpaBangunan },
                { label: "Minimarket / Swalayan", val: infrastrukturEkonomi.minimarket },
                { label: "Restoran / Makan", val: infrastrukturEkonomi.restoran },
                { label: "Warung / Kedai", val: infrastrukturEkonomi.warungMakanan },
                { label: "Hotel", val: infrastrukturEkonomi.hotel },
                { label: "Penginapan / Hostel", val: infrastrukturEkonomi.penginapan },
                { label: "Toko Kelontong", val: infrastrukturEkonomi.tokoKelontong },
              ].map((item, i) => (
                <Card key={i} className="border-0 shadow-sm text-center">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                      <Store className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{item.val || 0}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
