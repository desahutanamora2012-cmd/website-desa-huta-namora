import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { useDesaStatus } from "@/hooks/useDesaStatus";
import { Building2 } from "lucide-react";
import { SotkUnifiedChart } from "@/components/sotk";

export default function StrukturPage() {
  const { labels } = useDesaStatus();
  
  // Fetch SOTK Data
  const { data: jabatanSotkList, isLoading: jabatanLoading } =
    trpc.desa.jabatanSotk.list.useQuery();
  const { data: dusunSotkList, isLoading: dusunLoading } = 
    trpc.desa.dusunSotk.list.useQuery();

  if (jabatanLoading || dusunLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700 mx-auto mb-4" />
            <p className="text-slate-600 text-sm font-medium">Memuat struktur organisasi...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white py-12 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 sm:px-6 lg:px-8">
          <span className="bg-teal-500/20 text-teal-200 border border-teal-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Struktur Pemerintahan Desa
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Struktur Organisasi dan Tata Kerja (SOTK)
          </h1>
          <p className="text-teal-100/90 mt-2 font-medium max-w-2xl text-sm sm:text-base">
            Bagan resmi susunan jabatan, relasi struktural, dan personil {labels.namaBadan}.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Chart View */}
        {jabatanSotkList && jabatanSotkList.length > 0 ? (
          <div className="bg-white border border-slate-100 shadow-md rounded-3xl overflow-hidden p-6 relative bg-slate-50/50">
            <SotkUnifiedChart 
              jabatanList={jabatanSotkList} 
              dusunList={dusunSotkList || []} 
            />
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-100 shadow-md rounded-2xl">
            <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Struktur Organisasi Belum Diatur</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Silakan tambahkan data susunan jabatan di halaman administrator terlebih dahulu.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
