import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";

const jenisOptions = [
  { value: "puskesmas", label: "Puskesmas" },
  { value: "poliklinik", label: "Poliklinik" },
  { value: "rumah_sakit", label: "Rumah Sakit" },
  { value: "apotek", label: "Apotek" },
  { value: "klinik", label: "Klinik" },
  { value: "posyandu", label: "Posyandu" },
  { value: "praktik_dokter", label: "Praktik Dokter" },
  { value: "praktik_bidan", label: "Praktik Bidan" },
];

export default function AdminKesehatan() {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    namaSarana: "",
    jenis: "puskesmas" as any,
    alamat: "",
    latitude: "",
    longitude: "",
    pimpinan: "",
    kontakNomor: "",
    kontakEmail: "",
    deskripsi: "",
    fotoUrl: "",
    jamBuka: "",
    jamTutup: "",
    layanan: [] as string[],
    urutan: 0,
  });
  const [layananInput, setLayananInput] = useState("");

  const { data: kesehatanList, isLoading } =
    trpc.desa.kesehatan.list.useQuery();

  const create = trpc.desa.kesehatan.create.useMutation({
    onSuccess: () => {
      utils.desa.kesehatan.list.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Sarana Kesehatan berhasil ditambahkan!");
    },
    onError: () => toast.error("Gagal menambahkan sarana kesehatan"),
  });

  const update = trpc.desa.kesehatan.update.useMutation({
    onSuccess: () => {
      utils.desa.kesehatan.list.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Sarana Kesehatan berhasil diperbarui!");
    },
    onError: () => toast.error("Gagal memperbarui sarana kesehatan"),
  });

  const deleteMutation = trpc.desa.kesehatan.delete.useMutation({
    onSuccess: () => {
      utils.desa.kesehatan.list.invalidate();
      toast.success("Sarana Kesehatan berhasil dihapus!");
    },
    onError: () => toast.error("Gagal menghapus sarana kesehatan"),
  });

  const resetForm = () => {
    setForm({
      namaSarana: "",
      jenis: "puskesmas" as any,
      alamat: "",
      latitude: "",
      longitude: "",
      pimpinan: "",
      kontakNomor: "",
      kontakEmail: "",
      deskripsi: "",
      fotoUrl: "",
      jamBuka: "",
      jamTutup: "",
      layanan: [],
      urutan: 0,
    });
    setEditingId(null);
    setLayananInput("");
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      namaSarana: item.namaSarana || "",
      jenis: item.jenis,
      alamat: item.alamat || "",
      latitude: item.latitude || "",
      longitude: item.longitude || "",
      pimpinan: item.pimpinan || "",
      kontakNomor: item.kontakNomor || "",
      kontakEmail: item.kontakEmail || "",
      deskripsi: item.deskripsi || "",
      fotoUrl: item.fotoUrl || "",
      jamBuka: item.jamBuka || "",
      jamTutup: item.jamTutup || "",
      layanan: item.layanan || [],
      urutan: item.urutan || 0,
    });
    setDialogOpen(true);
  };

  const handleAddLayanan = () => {
    if (layananInput.trim()) {
      setForm({
        ...form,
        layanan: [...form.layanan, layananInput],
      });
      setLayananInput("");
    }
  };

  const handleRemoveLayanan = (index: number) => {
    setForm({
      ...form,
      layanan: form.layanan.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaSarana || !form.alamat) {
      toast.error("Nama dan alamat harus diisi");
      return;
    }
    
  // Convert string fields to proper types (sesuaikan dengan schema zod backend)
    const submitData = {
      ...form,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      urutan: Number(form.urutan ?? 0),
    };
    
    if (editingId) update.mutate({ id: editingId, ...submitData });
    else create.mutate(submitData);
  };

  const getJenisLabel = (jenis: string) => {
    return jenisOptions.find((j) => j.value === jenis)?.label || jenis;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Kelola Kesehatan
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Mengelola daftar sarana kesehatan di desa
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-800 hover:to-pink-800"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Tambah Sarana Kesehatan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingId ? "Edit" : "Tambah"} Sarana Kesehatan
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bagian Informasi Dasar */}
                <div className="space-y-4 border-b pb-4">
                  <h3 className="font-semibold text-gray-700">Informasi Dasar</h3>
                  <div>
                    <Label className="text-gray-700">Nama Sarana *</Label>
                    <Input
                      value={form.namaSarana}
                      onChange={(e) =>
                        setForm({ ...form, namaSarana: e.target.value })
                      }
                      placeholder="Contoh: Puskesmas Desa..."
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Jenis Sarana *</Label>
                    <Select
                      value={form.jenis}
                      onValueChange={(value) =>
                        setForm({ ...form, jenis: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jenisOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700">Alamat *</Label>
                    <Input
                      value={form.alamat}
                      onChange={(e) =>
                        setForm({ ...form, alamat: e.target.value })
                      }
                      placeholder="Contoh: Jl. Kesehatan No. 123"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700">Latitude</Label>
                      <Input
                        value={form.latitude}
                        onChange={(e) =>
                          setForm({ ...form, latitude: e.target.value })
                        }
                        placeholder="-6.1234"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Longitude</Label>
                      <Input
                        value={form.longitude}
                        onChange={(e) =>
                          setForm({ ...form, longitude: e.target.value })
                        }
                        placeholder="107.5678"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian Pimpinan & Kontak */}
                <div className="space-y-4 border-b pb-4">
                  <h3 className="font-semibold text-gray-700">
                    Pimpinan & Kontak
                  </h3>
                  <div>
                    <Label className="text-gray-700">Nama Pimpinan</Label>
                    <Input
                      value={form.pimpinan}
                      onChange={(e) =>
                        setForm({ ...form, pimpinan: e.target.value })
                      }
                      placeholder="Contoh: Dr. Ahmad Wijaya"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700">Nomor Telepon</Label>
                      <Input
                        value={form.kontakNomor}
                        onChange={(e) =>
                          setForm({ ...form, kontakNomor: e.target.value })
                        }
                        placeholder="+6281234567890"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Email</Label>
                      <Input
                        value={form.kontakEmail}
                        onChange={(e) =>
                          setForm({ ...form, kontakEmail: e.target.value })
                        }
                        placeholder="info@puskesmas.sch.id"
                        type="email"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian Jam Operasional */}
                <div className="space-y-4 border-b pb-4">
                  <h3 className="font-semibold text-gray-700">
                    Jam Operasional
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700">Jam Buka</Label>
                      <Input
                        value={form.jamBuka}
                        onChange={(e) =>
                          setForm({ ...form, jamBuka: e.target.value })
                        }
                        placeholder="08:00"
                        type="time"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Jam Tutup</Label>
                      <Input
                        value={form.jamTutup}
                        onChange={(e) =>
                          setForm({ ...form, jamTutup: e.target.value })
                        }
                        placeholder="17:00"
                        type="time"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian Layanan */}
                <div className="space-y-4 border-b pb-4">
                  <h3 className="font-semibold text-gray-700">Layanan</h3>
                  <div className="flex gap-2">
                    <Input
                      value={layananInput}
                      onChange={(e) => setLayananInput(e.target.value)}
                      placeholder="Contoh: Pemeriksaan Umum, Vaksinasi"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddLayanan();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddLayanan}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Tambah
                    </Button>
                  </div>
                  {form.layanan.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.layanan.map((layanan, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                        >
                          {layanan}
                          <button
                            type="button"
                            onClick={() => handleRemoveLayanan(idx)}
                            className="font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bagian Deskripsi & Foto */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700">Foto URL</Label>
                    <Input
                      value={form.fotoUrl}
                      onChange={(e) =>
                        setForm({ ...form, fotoUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Deskripsi</Label>
                    <Textarea
                      value={form.deskripsi}
                      onChange={(e) =>
                        setForm({ ...form, deskripsi: e.target.value })
                      }
                      placeholder="Deskripsi sarana kesehatan..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Urutan</Label>
                    <Input
                      type="number"
                      value={form.urutan}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          urutan: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-800 hover:to-pink-800"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Menyimpan..."
                    : editingId
                    ? "Perbarui Sarana"
                    : "Simpan Sarana"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : kesehatanList && kesehatanList.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Nama</TableHead>
                      <TableHead className="font-semibold">Jenis</TableHead>
                      <TableHead className="font-semibold">Pimpinan</TableHead>
                      <TableHead className="font-semibold">Jam Operasional</TableHead>
                      <TableHead className="font-semibold">Kontak</TableHead>
                      <TableHead className="font-semibold text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kesehatanList.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {item.namaSarana}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                            {getJenisLabel(item.jenis)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.pimpinan || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.jamBuka && item.jamTutup
                            ? `${item.jamBuka} - ${item.jamTutup}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.kontakNomor ? (
                            <a
                              href={`tel:${item.kontakNomor}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {item.kontakNomor}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteMutation.mutate({ id: item.id })}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Belum ada data sarana kesehatan
                </p>
                <Button
                  className="bg-red-700 hover:bg-red-800"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Sarana Kesehatan
                  Pertama
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
