import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Newspaper,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminBerita() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    judul: "",
    slug: "",
    isi: "",
    gambarSampul: "",
    kategori: "pengumuman" as "pengumuman" | "berita",
    status: "draft" as "draft" | "published" | "archived",
  });

  const { data: beritaList, isLoading } = trpc.desa.berita.list.useQuery({
    search: search || undefined,
  });

  const create = trpc.desa.berita.create.useMutation({
    onSuccess: () => {
      utils.desa.berita.list.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Berita berhasil ditambahkan!");
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      const msg = error?.message || "Gagal menambahkan berita";
      toast.error(msg);
    },
  });

  const update = trpc.desa.berita.update.useMutation({
    onSuccess: () => {
      utils.desa.berita.list.invalidate();
      setDialogOpen(false);
      resetForm();
      toast.success("Berita berhasil diperbarui!");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      const msg = error?.message || "Gagal memperbarui berita";
      toast.error(msg);
    },
  });

  const deleteMutation = trpc.desa.berita.delete.useMutation({
    onSuccess: () => {
      utils.desa.berita.list.invalidate();
      toast.success("Berita berhasil dihapus!");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      const msg = error?.message || "Gagal menghapus berita";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setForm({
      judul: "",
      slug: "",
      isi: "",
      gambarSampul: "",
      kategori: "pengumuman",
      status: "draft",
    });
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      judul: item.judul,
      slug: item.slug,
      isi: item.isi,
      gambarSampul: item.gambarSampul || "",
      kategori: item.kategori as any,
      status: item.status as any,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!form.judul.trim()) {
      toast.error("Judul tidak boleh kosong");
      return;
    }

    if (!form.slug.trim()) {
      toast.error("Slug tidak boleh kosong");
      return;
    }

    if (!form.isi.trim()) {
      toast.error("Isi berita tidak boleh kosong");
      return;
    }

    if (editingId) {
      update.mutate({ id: editingId, ...form });
    } else {
      create.mutate(form);
    }
  };

  const generateSlug = (judul: string) => {
    return judul
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 100);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      published: "bg-emerald-100 text-emerald-700",
      draft: "bg-gray-100 text-gray-700",
      archived: "bg-red-100 text-red-700",
    };
    return (
      <Badge variant="secondary" className={colors[status] || colors.draft}>
        {status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kelola Berita
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Tambah, edit, dan hapus berita/pengumuman
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
                Tambah Berita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Berita" : "Tambah Berita"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Judul</Label>
                  <Input
                    value={form.judul}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        judul: e.target.value,
                        slug: editingId ? form.slug : generateSlug(e.target.value),
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kategori</Label>
                    <Select
                      value={form.kategori}
                      onValueChange={(v: any) =>
                        setForm({ ...form, kategori: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pengumuman">Pengumuman</SelectItem>
                        <SelectItem value="berita">Berita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v: any) =>
                        setForm({ ...form, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Gambar Sampul URL</Label>
                  <Input
                    value={form.gambarSampul}
                    onChange={(e) =>
                      setForm({ ...form, gambarSampul: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Isi Berita</Label>
                  <Textarea
                    value={form.isi}
                    onChange={(e) =>
                      setForm({ ...form, isi: e.target.value })
                    }
                    rows={10}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Menyimpan..."
                    : editingId
                      ? "Perbarui"
                      : "Simpan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari berita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Memuat...
                      </TableCell>
                    </TableRow>
                  ) : beritaList && beritaList.length > 0 ? (
                    beritaList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium max-w-xs truncate">
                            {item.judul}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.kategori}
                          </Badge>
                        </TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {item.tanggalPublish
                            ? new Date(
                                item.tanggalPublish
                              ).toLocaleDateString("id-ID")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Yakin ingin menghapus berita ini?"
                                  )
                                ) {
                                  deleteMutation.mutate({ id: item.id });
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Tidak ada data berita</p>
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
