import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import SubmenuHeader from "@/components/SubmenuHeader";

const kategoriLabels: Record<string, string> = {
  kegiatan: "Kegiatan",
  infraastruktur: "Infrastruktur",
  pariwisata: "Pariwisata",
  umkm: "UMKM",
  pertanian: "Pertanian",
  infografis: "Infografis",
  lainnya: "Lainnya",
};

export default function GaleriPage() {
  const { data: galeriList } = trpc.desa.galeri.list.useQuery();
  const [selectedKategori, setSelectedKategori] = useState("semua");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filtered = galeriList?.filter((g) => {
    if (g.kategori === "infografis") return false;
    if (selectedKategori === "semua") return true;
    return g.kategori === selectedKategori;
  });

  // Slider State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const getSlideImages = (item: any) => {
    if (!item) return [];
    const images = [item.gambarUrl];
    if (item.fotoUrls && Array.isArray(item.fotoUrls)) {
      images.push(...item.fotoUrls);
    }
    return images;
  };

  const slideImages = getSlideImages(selectedItem);

  useEffect(() => {
    if (!selectedItem || slideImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slideImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedItem, slideImages.length]);

  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [selectedItem]);

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
        title="Galeri Kegiatan" 
        subtitle="Dokumentasi kegiatan dan publikasi desa" 
      />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Filter Tabs */}
        <Tabs
          value={selectedKategori}
          onValueChange={setSelectedKategori}
          className="w-full"
        >
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent">
            <TabsTrigger
              value="semua"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Semua
            </TabsTrigger>
            {Object.entries(kategoriLabels).filter(([key]) => key !== "infografis").map(([key, label]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Gallery Grid */}
        {filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.gambarUrl}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-3">
                  <Badge
                    variant="secondary"
                    className="text-[10px] mb-1"
                  >
                    {kategoriLabels[item.kategori] || item.kategori}
                  </Badge>
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
                    {item.judul}
                  </h3>
                  {item.tanggal && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
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
                Tidak ada foto dalam kategori ini
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95 border-0">
          <DialogTitle className="sr-only">
            {selectedItem?.judul || "Preview"}
          </DialogTitle>
          {selectedItem && (
            <div className="relative">
              <div className="flex items-center justify-center min-h-[50vh] max-h-[85vh] p-4 relative group">
                <img
                  src={slideImages[currentSlideIndex]}
                  alt={`${selectedItem.judul} - ${currentSlideIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain transition-opacity duration-300"
                />
                
                {slideImages.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex((prev) => prev === 0 ? slideImages.length - 1 : prev - 1); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex((prev) => (prev + 1) % slideImages.length); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {slideImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex(idx); }}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentSlideIndex ? "bg-white scale-125" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="bg-white p-4">
                <Badge variant="secondary" className="mb-2">
                  {kategoriLabels[selectedItem.kategori] || selectedItem.kategori}
                </Badge>
                <h3 className="font-semibold text-lg">{selectedItem.judul}</h3>
                {selectedItem.deskripsi && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedItem.deskripsi}
                  </p>
                )}
                {selectedItem.tanggal && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedItem.tanggal)}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
