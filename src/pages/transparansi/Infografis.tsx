import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Calendar } from "lucide-react";
import { useState } from "react";
import SubmenuHeader from "@/components/SubmenuHeader";

export default function InfografisPage() {
  const { data: galeriList } = trpc.desa.galeri.list.useQuery();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filtered = galeriList?.filter((g) => g.kategori === "infografis");

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <SubmenuHeader 
        title="Infografis Desa" 
        subtitle="Publikasi dan data visual informasi desa" 
      />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={item.gambarUrl}
                    alt={item.judul}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <Badge variant="secondary" className="text-[10px] mb-2">
                    Infografis
                  </Badge>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {item.judul}
                  </h3>
                  {item.tanggal && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.tanggal)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Belum ada data infografis yang dipublikasikan.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox Dialog Fullscreen */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-full w-screen h-screen m-0 p-0 rounded-none bg-black/95 border-0 flex flex-col justify-center">
          <DialogTitle className="sr-only">
            {selectedItem?.judul || "Preview"}
          </DialogTitle>
          
          {/* Tombol Close Explicit */}
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          {selectedItem && (
            <div className="relative flex h-full w-full items-center justify-center p-4 md:p-12">
              <img
                src={selectedItem.gambarUrl}
                alt={selectedItem.judul}
                className="max-w-full max-h-[95vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
