import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import SubmenuHeader from "@/components/SubmenuHeader";

const COLORS = ["#059669", "#0891b2", "#d97706", "#dc2626", "#7c3aed"];

export default function ApbdesPage() {
  const { data: apbdesData } = trpc.desa.apbdes.getLatest.useQuery();

  const formatRupiah = (value: string | number | null) => {
    if (!value) return "Rp 0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const pendapatanChart =
    apbdesData?.rincianPendapatan?.map((item: any) => ({
      name: item.sumber,
      value: item.jumlah,
    })) || [];

  const belanjaChart =
    apbdesData?.rincianBelanja?.map((item: any) => ({
      name: item.bidang,
      value: item.jumlah,
    })) || [];

  const tahun = apbdesData?.tahun || new Date().getFullYear();

  return (
    <Layout>
      <SubmenuHeader 
        title={apbdesData?.judul || "Transparansi APBDes"} 
        subtitle={`Anggaran Pendapatan dan Belanja Desa Tahun ${tahun}`} 
      />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {apbdesData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatRupiah(apbdesData.pendapatanTotal)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total Pendapatan
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatRupiah(apbdesData.belanjaTotal)}
                      </p>
                      <p className="text-xs text-gray-500">Total Belanja</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatRupiah(apbdesData.pembiayaanTotal)}
                      </p>
                      <p className="text-xs text-gray-500">Pembiayaan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Infografis */}
            {apbdesData.gambarInfografis && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-emerald-700" />
                    Infografis APBDes {tahun}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={apbdesData.gambarInfografis}
                    alt={`Infografis APBDes ${tahun}`}
                    className="w-full max-w-3xl mx-auto rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pendapatan Chart */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Rincian Pendapatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendapatanChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pendapatanChart}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pendapatanChart.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatRupiah(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      Data rincian pendapatan tidak tersedia
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Belanja Chart */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Rincian Belanja</CardTitle>
                </CardHeader>
                <CardContent>
                  {belanjaChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={belanjaChart} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={150}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value: number) => formatRupiah(value)}
                        />
                        <Bar dataKey="value" fill="#059669" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      Data rincian belanja tidak tersedia
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Dokumen URL */}
            {apbdesData.dokumenUrl && (
              <Card className="border-0 shadow-sm mt-8">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    Dokumen Lengkap APBDes {tahun}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-4">
                    <iframe 
                      src={apbdesData.dokumenUrl} 
                      className="w-full h-[600px]"
                      title={`Dokumen APBDes ${tahun}`}
                    />
                  </div>
                  <a
                    href={apbdesData.dokumenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-md"
                  >
                    <FileText className="w-4 h-4" />
                    Buka di Tab Baru / Unduh PDF
                  </a>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <PieChartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Data APBDes belum tersedia. Silakan hubungi admin untuk
                melengkapi informasi.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
