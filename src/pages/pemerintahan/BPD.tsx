import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Vote, Gavel } from "lucide-react";
import SubmenuHeader from "@/components/SubmenuHeader";

export default function BPDPage() {
  const { data: bpdList } = trpc.desa.lembaga.list.useQuery({ jenis: "bpd" });
  const bpd = bpdList?.[0];
  const { data: bpdImageUrl } = trpc.desa.profil.getByKey.useQuery({ kunci: "sotk_bpd_image_url" });

  return (
    <Layout>
      <SubmenuHeader 
        title="Badan Permusyawaratan Desa (BPD)" 
        subtitle="Lembaga legislatif dan pengawas pemerintahan desa" 
      />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">



        {/* Bagan SOTK BPD */}
        {bpdImageUrl ? (
          <Card className="border-0 shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="text-center border-b border-gray-100 bg-white/80">
              <CardTitle className="text-2xl text-emerald-800">Bagan Struktur Organisasi BPD</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex justify-center">
                <img 
                  src={bpdImageUrl} 
                  alt="Struktur SOTK BPD" 
                  className="max-w-full rounded-xl shadow-md border border-gray-100 hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm bg-gray-50 border-dashed border-2 border-gray-200">
            <CardContent className="p-12 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>Bagan Struktur Organisasi BPD belum tersedia.</p>
            </CardContent>
          </Card>
        )}

        {/* Deskripsi */}
        {bpd?.deskripsi && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Tentang BPD</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{bpd.deskripsi}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
