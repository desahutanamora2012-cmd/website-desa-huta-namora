import { useMemo, useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getReplaceDesaTerm, useDesaStatus } from "@/hooks/useDesaStatus";

export default function AdminSotkPage() {
  const utils = trpc.useUtils();
  const { labels, statusDesa } = useDesaStatus();

  const transformLabel = (label: string) =>
    getReplaceDesaTerm(label, statusDesa);

  // Jabatan SOTK
  const { data: jabatanList, isLoading: jabatanLoading } =
    trpc.desa.jabatanSotk.list.useQuery();

  const createJabatan = trpc.desa.jabatanSotk.create.useMutation({
    onSuccess: () => {
      utils.desa.jabatanSotk.list.invalidate();
      setJabatanDialogOpen(false);
      resetJabatanForm();
      toast.success("Jabatan berhasil ditambahkan!");
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      toast.error(error?.message || "Gagal menambahkan jabatan");
    },
  });

  const updateJabatan = trpc.desa.jabatanSotk.update.useMutation({
    onSuccess: () => {
      utils.desa.jabatanSotk.list.invalidate();
      setJabatanDialogOpen(false);
      resetJabatanForm();
      toast.success("Jabatan berhasil diperbarui!");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error?.message || "Gagal memperbarui jabatan");
    },
  });

  const deleteJabatan = trpc.desa.jabatanSotk.delete.useMutation({
    onSuccess: () => {
      utils.desa.jabatanSotk.list.invalidate();
      toast.success("Jabatan berhasil dihapus!");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(error?.message || "Gagal menghapus jabatan");
    },
  });

  // Dusun SOTK
  const { data: dusunList, isLoading: dusunLoading } =
    trpc.desa.dusunSotk.list.useQuery();

  const createDusun = trpc.desa.dusunSotk.create.useMutation({
    onSuccess: () => {
      utils.desa.dusunSotk.list.invalidate();
      setDusunDialogOpen(false);
      resetDusunForm();
      toast.success("Dusun berhasil ditambahkan!");
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      toast.error(error?.message || "Gagal menambahkan dusun");
    },
  });

  const updateDusun = trpc.desa.dusunSotk.update.useMutation({
    onSuccess: () => {
      utils.desa.dusunSotk.list.invalidate();
      setDusunDialogOpen(false);
      resetDusunForm();
      toast.success("Dusun berhasil diperbarui!");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error?.message || "Gagal memperbarui dusun");
    },
  });

  const deleteDusun = trpc.desa.dusunSotk.delete.useMutation({
    onSuccess: () => {
      utils.desa.dusunSotk.list.invalidate();
      toast.success("Dusun berhasil dihapus!");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(error?.message || "Gagal menghapus dusun");
    },
  });

  // JABATAN STATE
  const [jabatanDialogOpen, setJabatanDialogOpen] = useState(false);
  const [editingJabatanId, setEditingJabatanId] = useState<number | null>(null);
  const [jabatanForm, setJabatanForm] = useState({
    namaJabatan: "",
    pejabatNama: "",
    fotoUrl: "",
    deskripsi: "",
    parentId: null as number | null,
    urutan: 0,
  });

  const resetJabatanForm = () => {
    setJabatanForm({
      namaJabatan: "",
      pejabatNama: "",
      fotoUrl: "",
      deskripsi: "",
      parentId: null,
      urutan: 0,
    });
    setEditingJabatanId(null);
  };

  const handleJabatanPhotoFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setJabatanForm((prev) => ({ ...prev, fotoUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditJabatan = (item: any) => {
    setEditingJabatanId(item.id);
    setJabatanForm({
      namaJabatan: item.namaJabatan,
      pejabatNama: item.pejabatNama,
      fotoUrl: item.fotoUrl || "",
      deskripsi: item.deskripsi || "",
      parentId: item.parentId,
      urutan: item.urutan || 0,
    });
    setJabatanDialogOpen(true);
  };

  const handleSubmitJabatan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jabatanForm.namaJabatan.trim()) {
      toast.error("Nama jabatan tidak boleh kosong");
      return;
    }

    if (!jabatanForm.pejabatNama.trim()) {
      toast.error("Nama pejabat tidak boleh kosong");
      return;
    }

    if (editingJabatanId) {
      updateJabatan.mutate({ id: editingJabatanId, ...jabatanForm });
    } else {
      createJabatan.mutate(jabatanForm);
    }
  };

  // DUSUN STATE
  const [dusunDialogOpen, setDusunDialogOpen] = useState(false);
  const [editingDusunId, setEditingDusunId] = useState<number | null>(null);
  const [dusunForm, setDusunForm] = useState({
    namaDusun: "",
    kepala: "",
    fotoKepala: "",
    deskripsi: "",
    urutan: 0,
  });

  const resetDusunForm = () => {
    setDusunForm({
      namaDusun: "",
      kepala: "",
      fotoKepala: "",
      deskripsi: "",
      urutan: 0,
    });
    setEditingDusunId(null);
  };

  const handleDusunPhotoFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDusunForm((prev) => ({ ...prev, fotoKepala: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditDusun = (item: any) => {
    setEditingDusunId(item.id);
    setDusunForm({
      namaDusun: item.namaDusun,
      kepala: item.kepala,
      fotoKepala: item.fotoKepala || "",
      deskripsi: item.deskripsi || "",
      urutan: item.urutan || 0,
    });
    setDusunDialogOpen(true);
  };

  const handleSubmitDusun = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dusunForm.namaDusun.trim()) {
      toast.error("Nama dusun tidak boleh kosong");
      return;
    }

    if (!dusunForm.kepala.trim()) {
      toast.error("Nama kepala dusun tidak boleh kosong");
      return;
    }

    if (editingDusunId) {
      updateDusun.mutate({ id: editingDusunId, ...dusunForm });
    } else {
      createDusun.mutate(dusunForm);
    }
  };

  // Render Level untuk Jabatan
  const getLevelLabel = (parentId: number | null) => {
    if (parentId === null) return `Level 1 (${labels.namaKepala})`;

    const parent = jabatanList?.find((j: any) => j.id === parentId);
    if (parent?.parentId === null)
      return `Level 2 (Sekretariat ${labels.statusDesa === "kelurahan" ? "Lurah" : "Desa"})`;
    if (parent?.parentId) return "Level 3 (Kasi / Kaur)";
    return "Level 2";
  };

  // SOTK BPD State
  const { data: bpdImageUrl, isLoading: bpdLoading } = trpc.desa.profil.getByKey.useQuery({ kunci: "sotk_bpd_image_url" });
  const [bpdImage, setBpdImage] = useState("");
  
  useEffect(() => {
    if (bpdImageUrl) setBpdImage(bpdImageUrl);
  }, [bpdImageUrl]);

  const setProfil = trpc.desa.profil.set.useMutation({
    onSuccess: () => {
      utils.desa.profil.getByKey.invalidate({ kunci: "sotk_bpd_image_url" });
      toast.success("Gambar SOTK BPD berhasil disimpan!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menyimpan gambar SOTK BPD");
    },
  });

  const handleSaveBpd = (e: React.FormEvent) => {
    e.preventDefault();
    setProfil.mutate({ kunci: "sotk_bpd_image_url", nilai: bpdImage });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Struktur Organisasi (SOTK)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola bagan struktur, jabatan, dan personel {labels.namaBadan}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="jabatan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jabatan" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              SOTK {labels.statusDesa === "kelurahan" ? "Kelurahan" : "Desa"}
            </TabsTrigger>
            <TabsTrigger value="bpd" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              SOTK BPD
            </TabsTrigger>
            <TabsTrigger value="dusun" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {labels.namaWilayah}
            </TabsTrigger>
          </TabsList>

          {/* TAB: JABATAN */}
          <TabsContent value="jabatan" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={jabatanDialogOpen} onOpenChange={setJabatanDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetJabatanForm();
                      setJabatanDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Jabatan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingJabatanId ? "Edit Jabatan" : "Tambah Jabatan"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingJabatanId
                        ? "Perbarui informasi jabatan"
                        : `Tambahkan jabatan baru ke struktur ${labels.namaPerangkat}`}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitJabatan} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Nama Jabatan *
                      </label>
                      <Input
                        value={jabatanForm.namaJabatan}
                        onChange={(e) =>
                          setJabatanForm({
                            ...jabatanForm,
                            namaJabatan: e.target.value,
                          })
                        }
                        placeholder={`Contoh: ${labels.namaKepala}, Sekretaris ${labels.statusDesa === "kelurahan" ? "Lurah" : "Desa"}`}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Nama Pejabat *
                      </label>
                      <Input
                        value={jabatanForm.pejabatNama}
                        onChange={(e) =>
                          setJabatanForm({
                            ...jabatanForm,
                            pejabatNama: e.target.value,
                          })
                        }
                        placeholder="Nama lengkap pejabat"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Atasan (Parent Jabatan)
                      </label>
                      <Select
                        value={jabatanForm.parentId?.toString() || "none"}
                        onValueChange={(val) =>
                          setJabatanForm({
                            ...jabatanForm,
                            parentId: val === "none" ? null : parseInt(val),
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={`Pilih atasan ${labels.namaBadan.toLowerCase()}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Tidak ada ({labels.namaKepala})
                          </SelectItem>
                          {jabatanList?.map((j: any) => (
                            <SelectItem key={j.id} value={j.id.toString()}>
                              {transformLabel(j.namaJabatan)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {getLevelLabel(jabatanForm.parentId)}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        URL Foto / Upload Foto
                      </label>
                      <Input
                        value={jabatanForm.fotoUrl}
                        onChange={(e) =>
                          setJabatanForm({
                            ...jabatanForm,
                            fotoUrl: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="mt-1"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleJabatanPhotoFile(e.target.files?.[0] || null)
                        }
                        className="mt-3 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                      />
                      {jabatanForm.fotoUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={jabatanForm.fotoUrl}
                            alt="Preview foto pejabat"
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Gunakan URL foto atau unggah file untuk preview.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Deskripsi
                      </label>
                      <Textarea
                        value={jabatanForm.deskripsi}
                        onChange={(e) =>
                          setJabatanForm({
                            ...jabatanForm,
                            deskripsi: e.target.value,
                          })
                        }
                        placeholder={`Keterangan tugas ${labels.namaPerangkat}`}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Urutan Tampil
                      </label>
                      <Input
                        type="number"
                        value={jabatanForm.urutan}
                        onChange={(e) =>
                          setJabatanForm({
                            ...jabatanForm,
                            urutan: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        createJabatan.isLoading || updateJabatan.isLoading
                      }
                    >
                      {createJabatan.isLoading || updateJabatan.isLoading
                        ? "Menyimpan..."
                        : editingJabatanId
                        ? "Perbarui"
                        : "Simpan"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Jabatan List */}
            <div className="space-y-2">
              {jabatanLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mx-auto" />
                  </CardContent>
                </Card>
              ) : jabatanList && jabatanList.length > 0 ? (
                <div className="space-y-3">
                  {jabatanList.map((jabatan: any) => (
                    <Card key={jabatan.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {jabatan.namaJabatan}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {jabatan.pejabatNama}
                                </p>
                              </div>
                              <span className="ml-auto px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded">
                                {getLevelLabel(jabatan.parentId)}
                              </span>
                            </div>
                            {jabatan.deskripsi && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                {jabatan.deskripsi}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditJabatan(jabatan)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteJabatan.mutate({ id: jabatan.id })}
                              disabled={deleteJabatan.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Belum ada jabatan. Tambahkan jabatan baru untuk memulai.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Info */}
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-4 text-sm text-blue-800">
                <p className="font-medium mb-2">💡 Catatan Struktur:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Jabatan dengan "Atasan: Tidak ada" adalah {labels.namaKepala} (Level 1)
                  </li>
                  <li>
                    Jabatan langsung di bawah {labels.namaKepala} adalah Level 2
                  </li>
                  <li>
                    Jabatan yang memiliki Level 2 sebagai atasan adalah Level 3 (Kasi/Kaur)
                  </li>
                  <li>
                    Misal: {labels.namaKepala} → Sekretariat → Kasi/Kaur
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: DUSUN */}
          <TabsContent value="dusun" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={dusunDialogOpen} onOpenChange={setDusunDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetDusunForm();
                      setDusunDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah {labels.namaWilayah}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDusunId
                        ? `Edit ${labels.namaWilayah}`
                        : `Tambah ${labels.namaWilayah}`}
                    </DialogTitle>
                    <DialogDescription>
                      {editingDusunId
                        ? `Perbarui informasi ${labels.namaWilayah.toLowerCase()}`
                        : `Tambahkan ${labels.namaWilayah.toLowerCase()} baru`}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitDusun} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Nama {labels.namaWilayah} *
                      </label>
                      <Input
                        value={dusunForm.namaDusun}
                        onChange={(e) =>
                          setDusunForm({
                            ...dusunForm,
                            namaDusun: e.target.value,
                          })
                        }
                        placeholder={`Contoh: ${labels.namaWilayah} Krajan`}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Nama Kepala {labels.namaWilayah} *
                      </label>
                      <Input
                        value={dusunForm.kepala}
                        onChange={(e) =>
                          setDusunForm({
                            ...dusunForm,
                            kepala: e.target.value,
                          })
                        }
                        placeholder={`Nama lengkap kepala ${labels.namaWilayah.toLowerCase()}`}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        URL Foto / Upload Foto Kepala {labels.namaWilayah}
                      </label>
                      <Input
                        value={dusunForm.fotoKepala}
                        onChange={(e) =>
                          setDusunForm({
                            ...dusunForm,
                            fotoKepala: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="mt-1"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleDusunPhotoFile(e.target.files?.[0] || null)
                        }
                        className="mt-3 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700"
                      />
                      {dusunForm.fotoKepala && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={dusunForm.fotoKepala}
                            alt={`Preview foto kepala ${labels.namaWilayah.toLowerCase()}`}
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Gunakan URL foto atau unggah file untuk preview.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Deskripsi
                      </label>
                      <Textarea
                        value={dusunForm.deskripsi}
                        onChange={(e) =>
                          setDusunForm({
                            ...dusunForm,
                            deskripsi: e.target.value,
                          })
                        }
                        placeholder={`Keterangan singkat tentang ${labels.namaWilayah.toLowerCase()}`}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Urutan Tampil
                      </label>
                      <Input
                        type="number"
                        value={dusunForm.urutan}
                        onChange={(e) =>
                          setDusunForm({
                            ...dusunForm,
                            urutan: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createDusun.isPending || updateDusun.isPending}
                    >
                      {createDusun.isPending || updateDusun.isPending
                        ? "Menyimpan..."
                        : editingDusunId
                        ? "Perbarui"
                        : "Simpan"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Dusun List */}
            <div className="space-y-2">
              {dusunLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mx-auto" />
                  </CardContent>
                </Card>
              ) : dusunList && dusunList.length > 0 ? (
                <div className="space-y-3">
                  {dusunList.map((dusun: any) => (
                    <Card key={dusun.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {dusun.namaDusun}
                            </p>
                            <p className="text-sm text-gray-600">
                              Kepala: {dusun.kepala}
                            </p>
                            {dusun.deskripsi && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                {dusun.deskripsi}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDusun(dusun)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteDusun.mutate({ id: dusun.id })}
                              disabled={deleteDusun.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Belum ada dusun. Tambahkan dusun baru.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* TAB: SOTK BPD */}
          <TabsContent value="bpd" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bagan SOTK BPD (Badan Permusyawaratan Desa)</CardTitle>
              </CardHeader>
              <CardContent>
                {bpdLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveBpd} className="space-y-6 max-w-2xl">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        URL Gambar Struktur SOTK BPD
                      </label>
                      <Input
                        value={bpdImage}
                        onChange={(e) => setBpdImage(e.target.value)}
                        placeholder="Contoh: https://ik.imagekit.io/.../sotk-bpd.jpg"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Masukkan tautan URL gambar struktur organisasi BPD Anda.
                      </p>
                    </div>

                    {bpdImage && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2">
                        <img
                          src={bpdImage}
                          alt="Preview SOTK BPD"
                          className="w-full object-contain max-h-[500px] rounded-lg"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={setProfil.isPending}
                    >
                      {setProfil.isPending ? "Menyimpan..." : "Simpan Gambar SOTK BPD"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
