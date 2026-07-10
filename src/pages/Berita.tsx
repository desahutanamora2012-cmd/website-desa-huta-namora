import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Newspaper,
  Calendar,
  Search,
  Megaphone,
  Radio,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import SubmenuHeader from "@/components/SubmenuHeader";

const kategoriConfig: Record<string, { label: string; icon: typeof FileText }> = {
  semua: { label: "Semua", icon: Newspaper },
  pengumuman: { label: "Pengumuman", icon: Megaphone },
  berita: { label: "Berita", icon: FileText },
};

export default function BeritaPage() {
  const { data: beritaList } = trpc.desa.berita.list.useQuery({
    status: "published",
  });
  const [activeTab, setActiveTab] = useState("semua");
  const [search, setSearch] = useState("");

  const filtered = beritaList
    ?.filter((b) => {
      if (activeTab === "semua") return true;
      return b.kategori === activeTab;
    })
    ?.filter((b) => {
      if (!search) return true;
      return b.judul.toLowerCase().includes(search.toLowerCase());
    });

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
        title="Publikasi & Berita" 
        subtitle="Kabar terbaru, pengumuman, dan informasi desa" 
      />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari berita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent">
            {Object.entries(kategoriConfig).map(([key, { label, icon: Icon }]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
              >
                <Icon className="w-3 h-3 mr-1" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Berita Grid */}
        {filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((berita) => (
              <Link key={berita.id} to={`/berita/${berita.slug}`}>
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full overflow-hidden group">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        berita.gambarSampul ||
                        "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600"
                      }
                      alt={berita.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          berita.kategori === "pengumuman"
                            ? "bg-orange-100 text-orange-700"
                            : berita.kategori === "berita"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {kategoriConfig[berita.kategori]?.label || berita.kategori}
                      </Badge>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(berita.tanggalPublish)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {berita.judul}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {berita.isi.replace(/<[^>]*>/g, "").substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {search
                  ? "Tidak ada hasil untuk pencarian Anda"
                  : "Tidak ada berita dalam kategori ini"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
