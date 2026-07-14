import { trpc } from "@/providers/trpc";
import { SotkUnifiedChart } from "../components/sotk";
import { Loader2, Users, AlertCircle } from "lucide-react";

/**
 * SOTK (Struktur Organisasi Tata Kerja) Page
 * Displays the organizational structure of the village government
 */
export default function SOTKPage() {
  const {
    data: jabatanList,
    isLoading: jabatanLoading,
    error: jabatanError,
  } = trpc.sotk.jabatan.list.useQuery();

  const { data: dusunList, isLoading: dusunLoading } =
    trpc.sotk.dusun.list.useQuery();

  const isLoading = jabatanLoading || dusunLoading;
  const error = jabatanError;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat struktur organisasi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-gray-600 mb-4">
            Terjadi kesalahan saat memuat struktur organisasi. Silakan coba
            lagi nanti.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const hasData = jabatanList && jabatanList.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Users className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Struktur Organisasi Tata Kerja
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Bagan organisasi pemerintahan desa yang menampilkan hierarki
                jabatan
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chart */}
        {hasData ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 overflow-x-auto">
            <SotkUnifiedChart
              jabatanList={jabatanList as any[]}
              dusunList={(dusunList as any[]) ?? []}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Belum Ada Data Struktur Organisasi
            </h2>
            <p className="text-gray-500">
              Struktur organisasi belum diatur. Silakan tambahkan data jabatan
              terlebih dahulu melalui halaman admin.
            </p>
          </div>
        )}

        {/* Info note for mobile */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            💡 Geser ke kanan/kiri untuk melihat seluruh bagan pada layar kecil.
          </p>
        </div>
      </main>
    </div>
  );
}