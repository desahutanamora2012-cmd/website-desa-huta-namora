import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AdminApbdes() {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ tahun: new Date().getFullYear(), pendapatanTotal: "", belanjaTotal: "", pembiayaanTotal: "", rincianPendapatan: "", rincianBelanja: "", dokumenUrl: "", gambarInfografis: "" });

  const { data: apbdesList, isLoading } = trpc.desa.apbdes.list.useQuery();

  const create = trpc.desa.apbdes.create.useMutation({
    onSuccess: (data) => {
      utils.desa.apbdes.list.setData(undefined, (prev: any[] | undefined) => [data, ...(prev ?? [])]);
      utils.desa.apbdes.getLatest.setData(undefined, data as any);
      utils.desa.apbdes.list.invalidate();
      utils.desa.apbdes.getLatest.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Berhasil ditambahkan!");
    },
    onError: () => toast.error("Gagal menambahkan"),
  });
  const update = trpc.desa.apbdes.update.useMutation({
    onSuccess: (data) => {
      utils.desa.apbdes.list.setData(undefined, (prev: any[] | undefined) => (prev ?? []).map((item) => item.id === data.id ? { ...item, ...data } : item));
      utils.desa.apbdes.getLatest.setData(undefined, data as any);
      utils.desa.apbdes.list.invalidate();
      utils.desa.apbdes.getLatest.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Berhasil diperbarui!");
    },
    onError: () => toast.error("Gagal memperbarui"),
  });
  const deleteMutation = trpc.desa.apbdes.delete.useMutation({
    onSuccess: (_data, variables) => {
      utils.desa.apbdes.list.setData(undefined, (prev: any[] | undefined) => (prev ?? []).filter((item) => item.id !== variables.id));
      utils.desa.apbdes.getLatest.setData(undefined, null);
      utils.desa.apbdes.list.invalidate();
      utils.desa.apbdes.getLatest.invalidate();
      toast.success("Berhasil dihapus!");
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  const resetForm = () => { setForm({ tahun: new Date().getFullYear(), pendapatanTotal: "", belanjaTotal: "", pembiayaanTotal: "", rincianPendapatan: "", rincianBelanja: "", dokumenUrl: "", gambarInfografis: "" }); setEditingId(null); };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({ tahun: item.tahun, pendapatanTotal: item.pendapatanTotal || "", belanjaTotal: item.belanjaTotal || "", pembiayaanTotal: item.pembiayaanTotal || "", rincianPendapatan: item.rincianPendapatan ? JSON.stringify(item.rincianPendapatan, null, 2) : "", rincianBelanja: item.rincianBelanja ? JSON.stringify(item.rincianBelanja, null, 2) : "", dokumenUrl: item.dokumenUrl || "", gambarInfografis: item.gambarInfografis || "" });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { tahun: form.tahun, pendapatanTotal: form.pendapatanTotal, belanjaTotal: form.belanjaTotal, pembiayaanTotal: form.pembiayaanTotal, dokumenUrl: form.dokumenUrl, gambarInfografis: form.gambarInfografis };
    if (form.rincianPendapatan) { try { data.rincianPendapatan = JSON.parse(form.rincianPendapatan); } catch { toast.error("JSON rincian pendapatan tidak valid"); return; } }
    if (form.rincianBelanja) { try { data.rincianBelanja = JSON.parse(form.rincianBelanja); } catch { toast.error("JSON rincian belanja tidak valid"); return; } }
    if (editingId) update.mutate({ id: editingId, ...data });
    else create.mutate(data);
  };

  const formatRupiah = (v: string | number | null) => {
    if (!v) return "Rp 0";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Kelola APBDes</h1><p className="text-gray-500 text-sm mt-1">Anggaran Pendapatan dan Belanja Desa</p></div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Tambah</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingId ? "Edit" : "Tambah"} APBDes</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Tahun</Label><Input type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })} required /></div>
                  <div><Label>Pendapatan Total</Label><Input value={form.pendapatanTotal} onChange={(e) => setForm({ ...form, pendapatanTotal: e.target.value })} placeholder="2850000000" /></div>
                  <div><Label>Belanja Total</Label><Input value={form.belanjaTotal} onChange={(e) => setForm({ ...form, belanjaTotal: e.target.value })} /></div>
                  <div><Label>Pembiayaan Total</Label><Input value={form.pembiayaanTotal} onChange={(e) => setForm({ ...form, pembiayaanTotal: e.target.value })} /></div>
                </div>
                <div><Label>Rincian Pendapatan (JSON)</Label><Textarea value={form.rincianPendapatan} onChange={(e) => setForm({ ...form, rincianPendapatan: e.target.value })} rows={4} placeholder='[{"sumber": "Dana Desa", "jumlah": 1200000000}]' /></div>
                <div><Label>Rincian Belanja (JSON)</Label><Textarea value={form.rincianBelanja} onChange={(e) => setForm({ ...form, rincianBelanja: e.target.value })} rows={4} placeholder='[{"bidang": "Pemerintahan", "jumlah": 800000000}]' /></div>
                <div><Label>Dokumen URL</Label><Input value={form.dokumenUrl} onChange={(e) => setForm({ ...form, dokumenUrl: e.target.value })} /></div>
                <div><Label>Gambar Infografis URL</Label><Input value={form.gambarInfografis} onChange={(e) => setForm({ ...form, gambarInfografis: e.target.value })} /></div>
                <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" disabled={create.isPending || update.isPending}>
                  {create.isPending || update.isPending ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Tahun</TableHead><TableHead>Pendapatan</TableHead><TableHead>Belanja</TableHead><TableHead className="w-[100px]">Aksi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8">Memuat...</TableCell></TableRow>
                  ) : apbdesList && apbdesList.length > 0 ? (
                    apbdesList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.tahun}</TableCell>
                        <TableCell>{formatRupiah(item.pendapatanTotal)}</TableCell>
                        <TableCell>{formatRupiah(item.belanjaTotal)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm("Yakin?")) deleteMutation.mutate({ id: item.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="text-center py-8"><DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-gray-500">Tidak ada data</p></TableCell></TableRow>
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
