import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, DollarSign, Star, ImageIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SubmenuHeader from "@/components/SubmenuHeader";

export default function PariwisataPage({ type }: { type?: "penginapan" | "objek_wisata" }) {
  const { data: pariwisataList } = trpc.desa.pariwisata.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filtered = useMemo(() => {
    if (!pariwisataList) return [];
    
    return pariwisataList.filter((item) => {
      // 1. Filter Kategori
      if (type && item.kategori !== type) return false;
      
      // 2. Filter Pencarian
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const nameOk = (item.namaPenginapan || "").toLowerCase().includes(q);
      const addrOk = (item.alamat || "").toLowerCase().includes(q);
      const fasilitasOk = (item.fasilitas || []).some((f: string) => (f || "").toLowerCase().includes(q));
      return nameOk || addrOk || fasilitasOk;
    });
  }, [pariwisataList, searchQuery, type]);

  const openWhatsApp = (nomor: string) => {
    const phoneNumber = (nomor || "").replace(/\D/g, "");
    if (!phoneNumber) return;
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  };

  return (
    <Layout>
      <SubmenuHeader 
        title={type === "objek_wisata" ? "Objek Wisata" : "Pariwisata & Penginapan"} 
        subtitle={type === "objek_wisata" ? "Eksplorasi keindahan alam dan tempat menarik di desa kami" : "Temukan berbagai pilihan penginapan nyaman di desa kami dengan fasilitas lengkap"} 
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder={`Cari ${type === "objek_wisata" ? "objek wisata" : "penginapan"} berdasarkan nama atau lokasi...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-emerald-700 focus:outline-none"
            />
            <span className="absolute right-4 top-3.5 text-gray-400">🔍</span>
          </div>
        </div>

        {filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filtered.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    selectedItem?.id === item.id
                      ? "border-emerald-700 bg-emerald-50 shadow-lg"
                      : "border-gray-200 hover:border-emerald-400 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.namaPenginapan}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="line-clamp-1">{item.alamat}</span>
                    </div>
                    {item.hargaMin && item.hargaMax && (
                      <div className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          Rp {Number(item.hargaMin).toLocaleString()} - {Number(item.hargaMax).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {item.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-700">{item.rating}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedItem ? (
                <Card className="border-0 shadow-xl overflow-hidden">
                  <CardContent className="p-0">
                    {selectedItem.fotoPenginapan && selectedItem.fotoPenginapan.length > 0 ? (
                      <Swiper
                        modules={[Navigation, Pagination, Autoplay, A11y]}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        className="w-full h-96"
                      >
                        {selectedItem.fotoPenginapan.map((foto: string, idx: number) => (
                          <SwiperSlide key={idx}>
                            <img
                              src={foto}
                              alt={`${selectedItem.namaPenginapan} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    ) : (
                      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    <div className="p-8 space-y-6">
                      <div className="border-b pb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedItem.namaPenginapan}</h2>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span>{selectedItem.alamat}</span>
                          </div>
                          {selectedItem.rating && (
                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-amber-700">{selectedItem.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedItem.hargaMin && selectedItem.hargaMax && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
                          <p className="text-gray-600 text-sm mb-2">Harga per {selectedItem.satuanHarga || "malam"}</p>
                          <p className="text-3xl font-bold text-emerald-700 mb-1">
                            Rp {Number(selectedItem.hargaMin).toLocaleString()} - {Number(selectedItem.hargaMax).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {selectedItem.deskripsi && (
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">Tentang</h3>
                          <p className="text-gray-700 leading-relaxed">{selectedItem.deskripsi}</p>
                        </div>
                      )}

                      {selectedItem.fasilitas && selectedItem.fasilitas.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">Fasilitas</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.fasilitas.map((fasilitas: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium"
                              >
                                ✓ {fasilitas}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">Hubungi Kami</h3>
                        {selectedItem.kontakWhatsapp ? (
                          <Button
                            onClick={() => openWhatsApp(selectedItem.kontakWhatsapp)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                          >
                            <Phone className="w-5 h-5" />
                            Hubungi via WhatsApp
                          </Button>
                        ) : (
                          <p className="text-gray-500">Kontak tidak tersedia</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg h-full flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <p className="text-gray-500 text-lg mb-4">Pilih penginapan dari daftar untuk melihat detail</p>
                    <p className="text-gray-400">Klik pada salah satu penginapan di sebelah kiri</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">
                {searchQuery ? "Tidak ada penginapan yang cocok dengan pencarian Anda" : "Belum ada data penginapan"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

