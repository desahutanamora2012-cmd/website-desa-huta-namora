import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function AdminStatistik() {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    tahun: new Date().getFullYear(),
    totalPenduduk: 0,
    totalKK: 0,
    totalLakiLaki: 0,
    totalPerempuan: 0,
    luasWilayah: "",
    jumlahDusun: 0,
    jumlahRT: 0,
    jumlahRW: 0,
    dataPendidikan: "",
    dataAngkatanKerja: "",
    dataUsia: "",
    infrastrukturPendidikan: "",
    infrastrukturKesehatan: "",
    infrastrukturEkonomi: "",
  });

  const { data: statistikList, isLoading } = trpc.desa.statistik.list.useQuery();

  const create = trpc.desa.statistik.create.useMutation({
    onSuccess: () => {
      utils.desa.statistik.list.invalidate();
      utils.desa.statistik.getLatest.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Data statistik berhasil ditambahkan!");
    },
    onError: () => toast.error("Gagal menambahkan data"),
  });

  const update = trpc.desa.statistik.update.useMutation({
    onSuccess: () => {
      utils.desa.statistik.list.invalidate();
      utils.desa.statistik.getLatest.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Data statistik berhasil diperbarui!");
    },
    onError: () => toast.error("Gagal memperbarui data"),
  });

  const deleteMutation = trpc.desa.statistik.delete.useMutation({
    onSuccess: () => {
      utils.desa.statistik.list.invalidate();
      utils.desa.statistik.getLatest.invalidate();
      toast.success("Data statistik berhasil dihapus!");
    },
    onError: () => toast.error("Gagal menghapus data"),
  });

  const resetForm = () => {
    setForm({
      tahun: new Date().getFullYear(),
      totalPenduduk: 0,
      totalKK: 0,
      totalLakiLaki: 0,
      totalPerempuan: 0,
      luasWilayah: "",
      jumlahDusun: 0,
      jumlahRT: 0,
      jumlahRW: 0,
      dataPendidikan: "",
      dataAngkatanKerja: "",
      dataUsia: "",
      infrastrukturPendidikan: JSON.stringify({
        tahun: new Date().getFullYear(), tk: 0, ra_ba: 0, sd: 0, mi: 0, smp: 0, mts: 0, sma: 0, ma: 0, smk: 0, perguruanTinggi: 0
      }, null, 2),
      infrastrukturKesehatan: JSON.stringify({
        tahun: new Date().getFullYear(), rumahSakit: 0, klinikUtama: 0, balaiKesehatan: 0, puskesmasInap: 0, puskesmasNonInap: 0, 
        puskesmasPembantu: 0, klinikPratama: 0, praktikDokter: 0, praktikBidan: 0, poskesdes: 0, 
        polindes: 0, apotek: 0, tokoObat: 0, posyandu: 0
      }, null, 2),
      infrastrukturEkonomi: JSON.stringify({
        tahun: new Date().getFullYear(), pertokoan: 0, pasarPermanen: 0, pasarSemiPermanen: 0, pasarTanpaBangunan: 0, minimarket: 0,
        restoran: 0, warungMakanan: 0, hotel: 0, penginapan: 0, tokoKelontong: 0
      }, null, 2),
    });
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      tahun: item.tahun,
      totalPenduduk: item.totalPenduduk || 0,
      totalKK: item.totalKK || 0,
      totalLakiLaki: item.totalLakiLaki || 0,
      totalPerempuan: item.totalPerempuan || 0,
      luasWilayah: item.luasWilayah || "",
      jumlahDusun: item.jumlahDusun || 0,
      jumlahRT: item.jumlahRT || 0,
      jumlahRW: item.jumlahRW || 0,
      dataPendidikan: item.dataPendidikan ? JSON.stringify(item.dataPendidikan, null, 2) : "",
      dataAngkatanKerja: item.dataAngkatanKerja ? JSON.stringify(item.dataAngkatanKerja, null, 2) : "",
      dataUsia: item.dataUsia ? JSON.stringify(item.dataUsia, null, 2) : "",
      infrastrukturPendidikan: item.infrastrukturPendidikan ? JSON.stringify(item.infrastrukturPendidikan, null, 2) : "",
      infrastrukturKesehatan: item.infrastrukturKesehatan ? JSON.stringify(item.infrastrukturKesehatan, null, 2) : "",
      infrastrukturEkonomi: item.infrastrukturEkonomi ? JSON.stringify(item.infrastrukturEkonomi, null, 2) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      tahun: form.tahun,
      totalPenduduk: form.totalPenduduk,
      totalKK: form.totalKK,
      totalLakiLaki: form.totalLakiLaki,
      totalPerempuan: form.totalPerempuan,
      luasWilayah: form.luasWilayah,
      jumlahDusun: form.jumlahDusun,
      jumlahRT: form.jumlahRT,
      jumlahRW: form.jumlahRW,
    };
    
    // Parse JSON fields
    const parseField = (fieldName: keyof typeof form, targetName: string) => {
      if (form[fieldName]) {
        try {
          data[targetName] = JSON.parse(form[fieldName] as string);
          return true;
        } catch {
          toast.error(`Format JSON ${targetName} tidak valid`);
          return false;
        }
      }
      return true;
    };

    if (!parseField('dataPendidikan', 'dataPendidikan')) return;
    if (!parseField('dataAngkatanKerja', 'dataAngkatanKerja')) return;
    if (!parseField('dataUsia', 'dataUsia')) return;
    if (!parseField('infrastrukturPendidikan', 'infrastrukturPendidikan')) return;
    if (!parseField('infrastrukturKesehatan', 'infrastrukturKesehatan')) return;
    if (!parseField('infrastrukturEkonomi', 'infrastrukturEkonomi')) return;

    if (editingId) {
      update.mutate({ id: editingId, ...data });
    } else {
      create.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kelola Statistik
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Data kependudukan, demografi, dan infrastruktur desa
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-emerald-700 hover:bg-emerald-800"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Statistik" : "Tambah Statistik"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="kependudukan" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="kependudukan">Kependudukan</TabsTrigger>
                    <TabsTrigger value="pendidikan">Infr. Pendidikan</TabsTrigger>
                    <TabsTrigger value="kesehatan">Infr. Kesehatan</TabsTrigger>
                    <TabsTrigger value="ekonomi">Infr. Ekonomi</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="kependudukan" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tahun</Label>
                        <Input
                          type="number"
                          value={form.tahun}
                          onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Total Penduduk</Label>
                        <Input
                          type="number"
                          value={form.totalPenduduk}
                          onChange={(e) => setForm({ ...form, totalPenduduk: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Total KK</Label>
                        <Input
                          type="number"
                          value={form.totalKK}
                          onChange={(e) => setForm({ ...form, totalKK: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Laki-laki</Label>
                        <Input
                          type="number"
                          value={form.totalLakiLaki}
                          onChange={(e) => setForm({ ...form, totalLakiLaki: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Perempuan</Label>
                        <Input
                          type="number"
                          value={form.totalPerempuan}
                          onChange={(e) => setForm({ ...form, totalPerempuan: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Luas Wilayah (Ha)</Label>
                        <Input
                          value={form.luasWilayah}
                          onChange={(e) => setForm({ ...form, luasWilayah: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Jumlah Dusun</Label>
                        <Input
                          type="number"
                          value={form.jumlahDusun}
                          onChange={(e) => setForm({ ...form, jumlahDusun: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Jumlah RT</Label>
                        <Input
                          type="number"
                          value={form.jumlahRT}
                          onChange={(e) => setForm({ ...form, jumlahRT: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Jumlah RW</Label>
                        <Input
                          type="number"
                          value={form.jumlahRW}
                          onChange={(e) => setForm({ ...form, jumlahRW: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Data Pendidikan (JSON)</Label>
                        <Textarea
                          value={form.dataPendidikan}
                          onChange={(e) => setForm({ ...form, dataPendidikan: e.target.value })}
                          rows={4}
                          className="font-mono text-sm"
                          placeholder='{"tidakSekolah": 0, "sd": 0, "smp": 0, "sma": 0, "diploma": 0, "sarjana": 0}'
                        />
                      </div>
                      <div>
                        <Label>Data Angkatan Kerja (JSON)</Label>
                        <Textarea
                          value={form.dataAngkatanKerja}
                          onChange={(e) => setForm({ ...form, dataAngkatanKerja: e.target.value })}
                          rows={4}
                          className="font-mono text-sm"
                          placeholder='{"bekerja": 0, "pengangguran": 0, "tidakBekerja": 0}'
                        />
                      </div>
                      <div>
                        <Label>Data Usia (JSON)</Label>
                        <Textarea
                          value={form.dataUsia}
                          onChange={(e) => setForm({ ...form, dataUsia: e.target.value })}
                          rows={4}
                          className="font-mono text-sm"
                          placeholder='{"range0_4": 0, ...}'
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pendidikan" className="space-y-4">
                    <div>
                      <Label>Infrastruktur Pendidikan (JSON)</Label>
                      <p className="text-sm text-gray-500 mb-2">Isi data fasilitas pendidikan yang ada di desa.</p>
                      <Textarea
                        value={form.infrastrukturPendidikan}
                        onChange={(e) => setForm({ ...form, infrastrukturPendidikan: e.target.value })}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="kesehatan" className="space-y-4">
                    <div>
                      <Label>Infrastruktur Kesehatan (JSON)</Label>
                      <p className="text-sm text-gray-500 mb-2">Isi data fasilitas kesehatan yang ada di desa.</p>
                      <Textarea
                        value={form.infrastrukturKesehatan}
                        onChange={(e) => setForm({ ...form, infrastrukturKesehatan: e.target.value })}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="ekonomi" className="space-y-4">
                    <div>
                      <Label>Infrastruktur Ekonomi (JSON)</Label>
                      <p className="text-sm text-gray-500 mb-2">Isi data fasilitas ekonomi yang ada di desa.</p>
                      <Textarea
                        value={form.infrastrukturEkonomi}
                        onChange={(e) => setForm({ ...form, infrastrukturEkonomi: e.target.value })}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="mr-2">
                    Batal
                  </Button>
                  <Button type="submit" disabled={create.isPending || update.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                    Simpan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Total Penduduk</TableHead>
                    <TableHead>Laki-laki</TableHead>
                    <TableHead>Perempuan</TableHead>
                    <TableHead>Jumlah KK</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : statistikList && statistikList.length > 0 ? (
                    statistikList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.tahun}</TableCell>
                        <TableCell>{item.totalPenduduk}</TableCell>
                        <TableCell>{item.totalLakiLaki}</TableCell>
                        <TableCell>{item.totalPerempuan}</TableCell>
                        <TableCell>{item.totalKK}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-2"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
                                deleteMutation.mutate({ id: item.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Belum ada data statistik
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
