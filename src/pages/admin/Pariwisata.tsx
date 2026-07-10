import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const fasilitasLabelPrefix = "✓";

export default function AdminPariwisata() {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    namaPenginapan: "",
    alamat: "",
    latitude: "",
    longitude: "",
    deskripsi: "",
    kategori: "penginapan" as "penginapan" | "objek_wisata",
    fotoPenginapan: [] as string[],
    kontakWhatsapp: "",
    hargaMin: "",
    hargaMax: "",
    satuanHarga: "per malam",
    fasilitas: [] as string[],
    rating: "",
    urutan: 0,
  });

  const [fotoInput, setFotoInput] = useState("");
  const [fasilitasInput, setFasilitasInput] = useState("");

  const { data: pariwisataList, isLoading } =
    trpc.desa.pariwisata.list.useQuery();

  const create = trpc.desa.pariwisata.create.useMutation({
    onSuccess: () => {
      utils.desa.pariwisata.list.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Penginapan berhasil ditambahkan!");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Gagal menambahkan penginapan");
    },
  });

  const update = trpc.desa.pariwisata.update.useMutation({
    onSuccess: () => {
      utils.desa.pariwisata.list.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Penginapan berhasil diperbarui!");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Gagal memperbarui penginapan");
    },
  });

  const deleteMutation = trpc.desa.pariwisata.delete.useMutation({
    onSuccess: () => {
      utils.desa.pariwisata.list.invalidate();
      toast.success("Penginapan berhasil dihapus!");
    },
    onError: (e) => {
      console.error(e);
      toast.error("Gagal menghapus penginapan");
    },
  });

  const resetForm = () => {
    setForm({
      namaPenginapan: "",
      alamat: "",
      latitude: "",
      longitude: "",
      deskripsi: "",
      kategori: "penginapan",
      fotoPenginapan: [],
      kontakWhatsapp: "",
      hargaMin: "",
      hargaMax: "",
      satuanHarga: "per malam",
      fasilitas: [],
      rating: "",
      urutan: 0,
    });
    setEditingId(null);
    setDialogOpen(false);
    setFotoInput("");
    setFasilitasInput("");
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      namaPenginapan: item.namaPenginapan || "",
      alamat: item.alamat || "",
      latitude: item.latitude || "",
      longitude: item.longitude || "",
      deskripsi: item.deskripsi || "",
      kategori: item.kategori || "penginapan",
      fotoPenginapan: item.fotoPenginapan || [],
      kontakWhatsapp: item.kontakWhatsapp || "",
      hargaMin: item.hargaMin || "",
      hargaMax: item.hargaMax || "",
      satuanHarga: item.satuanHarga || "per malam",
      fasilitas: item.fasilitas || [],
      rating: item.rating || "",
      urutan: item.urutan || 0,
    });
    setDialogOpen(true);
  };

  const handleAddFoto = () => {
    if (fotoInput.trim()) {
      setForm((prev) => ({
        ...prev,
        fotoPenginapan: [...prev.fotoPenginapan, fotoInput.trim()],
      }));
      setFotoInput("");
    }
  };

  const handleRemoveFoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      fotoPenginapan: prev.fotoPenginapan.filter((_, i) => i !== index),
    }));
  };

  const handleAddFasilitas = () => {
    if (fasilitasInput.trim()) {
      setForm((prev) => ({
        ...prev,
        fasilitas: [...prev.fasilitas, fasilitasInput.trim()],
      }));
      setFasilitasInput("");
    }
  };

  const handleRemoveFasilitas = (index: number) => {
    setForm((prev) => ({
      ...prev,
      fasilitas: prev.fasilitas.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.namaPenginapan || !form.alamat) {
      toast.error("Nama penginapan dan alamat harus diisi");
      return;
    }

    const submitData = {
      ...form,
      // backend schema expects optional string latitude/longitude
      latitude: form.latitude ? form.latitude : undefined,
      longitude: form.longitude ? form.longitude : undefined,
      hargaMin: form.hargaMin ? form.hargaMin : undefined,
      hargaMax: form.hargaMax ? form.hargaMax : undefined,
      rating: form.rating ? form.rating : undefined,
      urutan: Number(form.urutan ?? 0),
      kategori: form.kategori,
      // ensure arrays
      fotoPenginapan: form.fotoPenginapan || [],
      fasilitas: form.fasilitas || [],
    };

    if (editingId) update.mutate({ id: editingId, ...submitData } as any);
    else create.mutate(submitData as any);
  };

  const mapsLinkFor = (item: any) => {
    const lat = item.latitude;
    const lng = item.longitude;
    if (lat && lng) {
      return `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.alamat || "")}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Pariwisata</h1>
            <p className="text-gray-500 text-sm mt-1">Data Penginapan dan Objek Wisata untuk ditampilkan di menu Potensi Desa</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800"
                onClick={() => {
                  setEditingId(null);
                  setDialogOpen(true);
                  setForm((prev) => ({ ...prev }));
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Tambah Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingId ? "Edit" : "Tambah"} Data Pariwisata</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700">Nama Tempat / Penginapan *</Label>
                    <Input
                      value={form.namaPenginapan}
                      onChange={(e) => setForm((p) => ({ ...p, namaPenginapan: e.target.value }))}
                      placeholder="Contoh: Homestay Makmur"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Kategori *</Label>
                    <Select value={form.kategori} onValueChange={(val: any) => setForm(p => ({ ...p, kategori: val }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="penginapan">Penginapan</SelectItem>
                        <SelectItem value="objek_wisata">Objek Wisata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700">Urutan</Label>
                    <Input
                      type="number"
                      value={form.urutan}
                      onChange={(e) => setForm((p) => ({ ...p, urutan: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700">Alamat *</Label>
                  <Input
                    value={form.alamat}
                    onChange={(e) => setForm((p) => ({ ...p, alamat: e.target.value }))}
                    placeholder="Contoh: Jl. Merdeka No. 123"
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700">Latitude (optional)</Label>
                    <Input
                      value={form.latitude}
                      onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                      placeholder="-6.1234"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Longitude (optional)</Label>
                    <Input
                      value={form.longitude}
                      onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                      placeholder="107.5678"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-700">Harga Min (optional)</Label>
                    <Input
                      value={form.hargaMin}
                      onChange={(e) => setForm((p) => ({ ...p, hargaMin: e.target.value }))}
                      placeholder="100000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Harga Max (optional)</Label>
                    <Input
                      value={form.hargaMax}
                      onChange={(e) => setForm((p) => ({ ...p, hargaMax: e.target.value }))}
                      placeholder="500000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Satuan Harga</Label>
                    <Input
                      value={form.satuanHarga}
                      onChange={(e) => setForm((p) => ({ ...p, satuanHarga: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700">Rating (optional)</Label>
                    <Input
                      value={form.rating}
                      onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
                      placeholder="4.5"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Kontak WhatsApp (optional)</Label>
                    <Input
                      value={form.kontakWhatsapp}
                      onChange={(e) => setForm((p) => ({ ...p, kontakWhatsapp: e.target.value }))}
                      placeholder="+62812345678"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700">Deskripsi</Label>
                  <Input
                    value={form.deskripsi}
                    onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                    placeholder="Uraian penginapan..."
                    className="mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Foto Penginapan (Slide)</h3>
                  <div className="flex gap-2">
                    <Input
                      value={fotoInput}
                      onChange={(e) => setFotoInput(e.target.value)}
                      placeholder="Masukkan URL foto"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddFoto} className="bg-blue-600 hover:bg-blue-700">Tambah</Button>
                  </div>
                  {form.fotoPenginapan.length === 0 ? (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Belum ada foto.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.fotoPenginapan.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-100 rounded p-2 gap-2">
                          <span className="text-sm truncate flex-1">{url}</span>
                          <Button type="button" size="sm" onClick={() => handleRemoveFoto(idx)} className="bg-red-600 hover:bg-red-700">Hapus</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Fasilitas</h3>
                  <div className="flex gap-2">
                    <Input
                      value={fasilitasInput}
                      onChange={(e) => setFasilitasInput(e.target.value)}
                      placeholder="Contoh: WiFi, AC, Kolam renang"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddFasilitas} className="bg-blue-600 hover:bg-blue-700">Tambah</Button>
                  </div>
                  {form.fasilitas.length === 0 ? (
                    <div className="text-sm text-gray-500">Belum ada fasilitas.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {form.fasilitas.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">{fasilitasLabelPrefix} {f}</span>
                          <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveFasilitas(idx)} className="text-red-600 hover:text-red-700 hover:bg-transparent">×</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Menyimpan..."
                    : editingId
                      ? "Perbarui Data"
                      : "Simpan Data"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : pariwisataList && pariwisataList.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Foto</TableHead>
                      <TableHead className="font-semibold">Nama</TableHead>
                      <TableHead className="font-semibold">Kategori</TableHead>
                      <TableHead className="font-semibold">Alamat</TableHead>
                      <TableHead className="font-semibold">Harga</TableHead>
                      <TableHead className="font-semibold">Rating</TableHead>
                      <TableHead className="font-semibold text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pariwisataList.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="w-24">
                          {item.fotoPenginapan?.[0] ? (
                            <img
                              src={item.fotoPenginapan[0]}
                              alt={item.namaPenginapan}
                              className="w-16 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">-</div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.namaPenginapan}</TableCell>
                        <TableCell className="text-sm">
                          {item.kategori === "objek_wisata" ? "Objek Wisata" : "Penginapan"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{item.alamat}</TableCell>
                        <TableCell className="text-sm">
                          {item.hargaMin && item.hargaMax
                            ? `Rp ${Number(item.hargaMin).toLocaleString()} - Rp ${Number(item.hargaMax).toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">{item.rating ? `⭐ ${item.rating}` : "-"}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button size="sm" onClick={() => handleEdit(item)} className="bg-blue-600 hover:bg-blue-700"> 
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" onClick={() => deleteMutation.mutate({ id: item.id })} className="bg-red-600 hover:bg-red-700"> 
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">Belum ada data penginapan.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

