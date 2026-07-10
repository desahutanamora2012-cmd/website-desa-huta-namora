import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Plus,
  Pencil,
  Trash2,
  Palette,
  MapPin,
  Users,
  Zap,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

const normalizeBorderRadius = (value: unknown): "none" | "sm" | "md" | "lg" | "full" => {
  const allowed = ["none", "sm", "md", "lg", "full"] as const;
  if (typeof value !== "string") return "md";

  const normalized = value.trim().toLowerCase();
  if (allowed.includes(normalized as (typeof allowed)[number])) {
    return normalized as (typeof allowed)[number];
  }

  const mapped: Record<string, "none" | "sm" | "md" | "lg" | "full"> = {
    "rounded-none": "none",
    "rounded-sm": "sm",
    "rounded-md": "md",
    "rounded-lg": "lg",
    "rounded-full": "full",
  };

  return mapped[normalized] ?? "md";
};

export default function AdminPengaturan() {
  const utils = trpc.useUtils();

  // ===================== TEMA =====================
  const {
    data: temaWebsite,
    isLoading: temaLoading,
  } = trpc.desa.tema.temaWebsite.list.useQuery();

  const tema = Array.isArray(temaWebsite) ? temaWebsite[0] : temaWebsite;

  const updateTema = trpc.desa.tema.temaWebsite.update.useMutation({
    onSuccess: async (_data, variables) => {
      const normalized = {
        ...(variables as Record<string, unknown>),
        warnaSkunder: (variables as any).warnaSkunder ?? (variables as any).warnaSekunder,
        warnaAccent: (variables as any).warnaAccent ?? (variables as any).warnaAksen,
      };
      delete (normalized as any).warnaSekunder;
      delete (normalized as any).warnaAksen;

      utils.desa.tema.temaWebsite.list.setData(undefined, (prev: any) => {
        if (!prev) return prev;
        const current = Array.isArray(prev) ? prev : [prev];
        return current.map((item: any, index: number) => (index === 0 ? { ...item, ...normalized } : item));
      });
      setTemaForm((prev) => ({ ...prev, ...(normalized as any) }));
      await utils.desa.tema.temaWebsite.list.invalidate();
      toast.success("Tema berhasil diperbarui!");
    },
    onError: () => toast.error("Gagal mengubah tema"),
  });

  const createTema = trpc.desa.tema.temaWebsite.create.useMutation({
    onSuccess: async () => {
      await utils.desa.tema.temaWebsite.list.invalidate();
      toast.success("Tema berhasil disimpan!");
    },
    onError: () => toast.error("Gagal menyimpan tema"),
  });

  const [temaForm, setTemaForm] = useState({
    statusDesa: "desa" as "desa" | "kelurahan",
    tema: "light" as "light" | "dark" | "custom",
    warnaPrimer: "#065f46",
    warnaSkunder: "#f3f4f6",
    warnaAccent: "#dc2626",
    backgroundImage1: "",
    backgroundImage2: "",
    backgroundImage3: "",
    backgroundAnimationSpeed: 5,
    logoUrl: "",
    logoKecilUrl: "",
    faviconUrl: "",
    runningTextAktif: 1,
    fontFamily: "system-ui",
    borderRadius: "md" as "none" | "sm" | "md" | "lg" | "full",
  });

  useEffect(() => {
    if (!tema) return;

    setTemaForm({
      statusDesa: (tema.statusDesa as "desa" | "kelurahan") ?? "desa",
      tema: (tema.tema as "light" | "dark" | "custom") ?? "light",
      warnaPrimer: tema.warnaPrimer || "#065f46",
      warnaSkunder: (tema as any).warnaSkunder || (tema as any).warnaSekunder || "#f3f4f6",
      warnaAccent: (tema as any).warnaAccent || "#dc2626",
      backgroundImage1: (tema as any).backgroundImage1 || "",
      backgroundImage2: (tema as any).backgroundImage2 || "",
      backgroundImage3: (tema as any).backgroundImage3 || "",
      backgroundAnimationSpeed: Number((tema as any).backgroundAnimationSpeed) || 5,
      logoUrl: (tema as any).logoUrl || "",
      logoKecilUrl: (tema as any).logoKecilUrl || "",
      faviconUrl: (tema as any).faviconUrl || "",
      runningTextAktif: Number((tema as any).runningTextAktif) || 1,
      fontFamily: (tema as any).fontFamily || "system-ui",
      borderRadius: normalizeBorderRadius((tema as any).borderRadius),
    });
  }, [tema]);

  const handleTemaSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedTemaForm = {
      ...temaForm,
      borderRadius: normalizeBorderRadius(temaForm.borderRadius),
    };

    const cleanData = Object.fromEntries(
      Object.entries(normalizedTemaForm).filter(([, v]) => v !== undefined && v !== null)
    );

    // updateTema expects { id, ...data } (backend has input.id)
    if (!tema?.id) {
      createTema.mutate(cleanData as any);
      return;
    }

    updateTema.mutate({
      id: tema.id,
      ...(cleanData as any),
    });
  };

  // ===================== PROFIL (Logo) =====================
  const {
    data: profilData,
    isLoading: profilLoading,
    refetch: refetchProfil,
  } = trpc.desa.profil.list.useQuery();

  const updateProfil = trpc.desa.profil.setMany.useMutation({
    onSuccess: async (_data, variables) => {
      utils.desa.profil.list.setData(undefined, (prev: Record<string, string> | undefined) => ({
        ...(prev ?? {}),
        ...(variables as Record<string, string>),
      }));
      await Promise.all([
        utils.desa.profil.list.invalidate(),
        refetchProfil(),
      ]);
      
      const vars = variables as Record<string, string>;
      if (vars.layanan_mandiri_url !== undefined) {
        toast.success("Link berhasil disimpan atau diperbarui!");
      } else {
        toast.success("Logo berhasil diperbarui!");
      }
    },
    onError: (_error, variables) => {
      const vars = variables as Record<string, string>;
      if (vars.layanan_mandiri_url !== undefined) {
        toast.error("Gagal menyimpan link");
      } else {
        toast.error("Gagal memperbarui logo");
      }
    },
  });

  const footerLogoUrlExisting = profilData?.footer_logo_url ?? "";
  const navbarLogoUrlExisting = profilData?.logo_url ?? "";
  const layananUrlExisting = profilData?.layanan_mandiri_url ?? "";
  const headerBgExisting = profilData?.header_submenu_bg ?? "from-emerald-700 to-teal-700";

  const [profilForm, setProfilForm] = useState({
    logoUrl: navbarLogoUrlExisting,
    footerLogoUrl: footerLogoUrlExisting,
    layananUrl: layananUrlExisting,
    headerBg: headerBgExisting,
  });

  useEffect(() => {
    setProfilForm({
      logoUrl: navbarLogoUrlExisting,
      footerLogoUrl: footerLogoUrlExisting,
      layananUrl: layananUrlExisting,
      headerBg: headerBgExisting,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navbarLogoUrlExisting, footerLogoUrlExisting, layananUrlExisting, headerBgExisting]);

  const handleProfilSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfil.mutate({
      logo_url: profilForm.logoUrl || "",
      footer_logo_url: profilForm.footerLogoUrl || "",
    } as any);
  };

  const handleLayananSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfil.mutate({
      layanan_mandiri_url: profilForm.layananUrl || "",
    } as any);
  };


  // ===================== DUSUN =====================
  const {
    data: dusunList,
    isLoading: dusunLoading,
    refetch: refetchDusun,
  } = trpc.desa.dusun.list.useQuery();

  const createDusun = trpc.desa.dusun.create.useMutation({
    onSuccess: () => {
      refetchDusun();
      setDusunForm({ nama: "", deskripsi: "", kepala: "", kontak: "", urutan: 0 });
      setDusunDialogOpen(false);
      toast.success("Dusun berhasil ditambahkan!");
    },
    onError: () => toast.error("Gagal menambahkan dusun"),
  });

  const updateDusun = trpc.desa.dusun.update.useMutation({
    onSuccess: () => {
      refetchDusun();
      setDusunForm({ nama: "", deskripsi: "", kepala: "", kontak: "", urutan: 0 });
      setEditingDusunId(null);
      setDusunDialogOpen(false);
      toast.success("Dusun berhasil diperbarui!");
    },
    onError: () => toast.error("Gagal memperbarui dusun"),
  });

  const deleteDusun = trpc.desa.dusun.delete.useMutation({
    onSuccess: () => {
      refetchDusun();
      toast.success("Dusun berhasil dihapus!");
    },
    onError: () => toast.error("Gagal menghapus dusun"),
  });

  const [dusunForm, setDusunForm] = useState({
    nama: "",
    deskripsi: "",
    kepala: "",
    kontak: "",
    urutan: 0,
  });
  const [dusunDialogOpen, setDusunDialogOpen] = useState(false);
  const [editingDusunId, setEditingDusunId] = useState<number | null>(null);

  const handleDusunSubmit = () => {
    if (!dusunForm.nama.trim()) {
      toast.error("Nama dusun harus diisi");
      return;
    }

    if (editingDusunId) {
      updateDusun.mutate({ id: editingDusunId, ...dusunForm });
    } else {
      createDusun.mutate(dusunForm as any);
    }
  };

  const handleEditDusun = (item: any) => {
    setEditingDusunId(item.id);
    setDusunForm({
      nama: item.nama,
      deskripsi: item.deskripsi || "",
      kepala: item.kepala || "",
      kontak: item.kontak || "",
      urutan: item.urutan || 0,
    });
    setDusunDialogOpen(true);
  };

  // ===================== JABATAN (jabatanDesa) =====================
  const {
    data: jabatanList,
    isLoading: jabatanLoading,
    refetch: refetchJabatan,
  } = trpc.desa.jabatanDesa.list.useQuery();

  const createJabatan = trpc.desa.jabatanDesa.create.useMutation({
    onSuccess: () => {
      refetchJabatan();
      setJabatanForm({ nama: "", pejabat: "", fotoUrl: "", deskripsi: "", urutan: 0 } as any);
      setJabatanDialogOpen(false);
      setEditingJabatanId(null);
      toast.success("Jabatan berhasil ditambahkan!");
    },
    onError: () => toast.error("Gagal menambahkan jabatan"),
  });

  const updateJabatan = trpc.desa.jabatanDesa.update.useMutation({
    onSuccess: () => {
      refetchJabatan();
      setJabatanForm({ nama: "", pejabat: "", fotoUrl: "", deskripsi: "", urutan: 0 } as any);
      setEditingJabatanId(null);
      setJabatanDialogOpen(false);
      toast.success("Jabatan berhasil diperbarui!");
    },
    onError: () => toast.error("Gagal memperbarui jabatan"),
  });

  const deleteJabatan = trpc.desa.jabatanDesa.delete.useMutation({
    onSuccess: () => {
      refetchJabatan();
      toast.success("Jabatan berhasil dihapus!");
    },
    onError: () => toast.error("Gagal menghapus jabatan"),
  });

  const [jabatanForm, setJabatanForm] = useState({
    nama: "",
    urutan: 0,
  } as any);

  const [jabatanDialogOpen, setJabatanDialogOpen] = useState(false);
  const [editingJabatanId, setEditingJabatanId] = useState<number | null>(null);

  const handleJabatanSubmit = () => {
    if (!jabatanForm.nama.trim()) {
      toast.error("Nama jabatan harus diisi");
      return;
    }

    if (editingJabatanId) {
      updateJabatan.mutate({ id: editingJabatanId, nama: jabatanForm.nama, urutan: jabatanForm.urutan });
    } else {
      createJabatan.mutate({ nama: jabatanForm.nama, urutan: jabatanForm.urutan });
    }
  };

  const handleEditJabatan = (item: any) => {
    setEditingJabatanId(item.id);
    setJabatanForm({
      nama: item.nama,
      urutan: item.urutan || 0,
    });
    setJabatanDialogOpen(true);
  };

  // ===================== RUNNING TEXT =====================
  const { data: runningTextList, isLoading: runningTextLoading, refetch: refetchRunningText } =
    trpc.desa.runningText.list.useQuery();

  const createRunningText = trpc.desa.runningText.create.useMutation({
    onSuccess: () => {
      refetchRunningText();
      setRunningTextForm({
        teks: "",
        warna: "#ffffff",
        backgroundColor: "#dc2626",
        kecepatan: 50,
        aktif: 1,
        urutan: 0,
      });
      setRunningTextDialogOpen(false);
      toast.success("Running text berhasil ditambahkan!");
    },
    onError: () => toast.error("Gagal menambahkan running text"),
  });

  const updateRunningText = trpc.desa.runningText.update.useMutation({
    onSuccess: () => {
      refetchRunningText();
      setRunningTextForm({
        teks: "",
        warna: "#ffffff",
        backgroundColor: "#dc2626",
        kecepatan: 50,
        aktif: 1,
        urutan: 0,
      });
      setEditingRunningTextId(null);
      setRunningTextDialogOpen(false);
      toast.success("Running text berhasil diperbarui!");
    },
    onError: () => toast.error("Gagal memperbarui running text"),
  });

  const deleteRunningText = trpc.desa.runningText.delete.useMutation({
    onSuccess: () => {
      refetchRunningText();
      toast.success("Running text berhasil dihapus!");
    },
    onError: () => toast.error("Gagal menghapus running text"),
  });

  const [runningTextForm, setRunningTextForm] = useState({
    teks: "",
    warna: "#ffffff",
    backgroundColor: "#dc2626",
    kecepatan: 50,
    aktif: 1,
    urutan: 0,
  });
  const [runningTextDialogOpen, setRunningTextDialogOpen] = useState(false);
  const [editingRunningTextId, setEditingRunningTextId] = useState<number | null>(null);

  const handleRunningTextSubmit = () => {
    if (!runningTextForm.teks.trim()) {
      toast.error("Teks running text harus diisi");
      return;
    }

    if (editingRunningTextId) {
      updateRunningText.mutate({ id: editingRunningTextId, ...runningTextForm });
    } else {
      createRunningText.mutate(runningTextForm as any);
    }
  };

  const handleEditRunningText = (item: any) => {
    setEditingRunningTextId(item.id);
    setRunningTextForm({
      teks: item.teks,
      warna: item.warna || "#ffffff",
      backgroundColor: item.backgroundColor || "#dc2626",
      kecepatan: item.kecepatan || 50,
      aktif: item.aktif || 1,
      urutan: item.urutan || 0,
    });
    setRunningTextDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Website</h1>
            <p className="text-gray-500 text-sm mt-1">Atur tampilan, tema, dan konten dinamis website</p>
          </div>
        </div>

        <Tabs defaultValue="tema" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="tema">
              <Palette className="w-4 h-4 mr-2" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="dusun">
              <MapPin className="w-4 h-4 mr-2" />
              Dusun
            </TabsTrigger>
            <TabsTrigger value="jabatan">
              <Users className="w-4 h-4 mr-2" />
              Pejabat
            </TabsTrigger>
            <TabsTrigger value="running-text">
              <Zap className="w-4 h-4 mr-2" />
              Running Text
            </TabsTrigger>
            <TabsTrigger value="layanan-mandiri">
              <Globe className="w-4 h-4 mr-2" />
              Layanan Mandiri
            </TabsTrigger>
          </TabsList>

          {/* TEMA */}
          <TabsContent value="tema" className="space-y-6">
            {temaLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            ) : (
              <form onSubmit={handleTemaSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Konfigurasi Dasar</CardTitle>
                    <CardDescription>Atur status dan tema dasar website</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Status Desa/Kelurahan</Label>
                        <Select value={temaForm.statusDesa} onValueChange={(value: any) => setTemaForm({ ...temaForm, statusDesa: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desa">Desa</SelectItem>
                            <SelectItem value="kelurahan">Kelurahan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tema</Label>
                        <Select value={temaForm.tema} onValueChange={(value: any) => setTemaForm({ ...temaForm, tema: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Terang</SelectItem>
                            <SelectItem value="dark">Gelap</SelectItem>
                            <SelectItem value="custom">Kustom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Warna</CardTitle>
                    <CardDescription>Atur palet warna website</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Warna Primer</Label>
                        <div className="flex gap-2 mt-2">
                          <Input type="color" value={temaForm.warnaPrimer} onChange={(e) => setTemaForm({ ...temaForm, warnaPrimer: e.target.value })} className="w-12 h-10" />
                          <Input type="text" value={temaForm.warnaPrimer} onChange={(e) => setTemaForm({ ...temaForm, warnaPrimer: e.target.value })} className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Warna Sekunder</Label>
                        <div className="flex gap-2 mt-2">
                          <Input type="color" value={temaForm.warnaSkunder} onChange={(e) => setTemaForm({ ...temaForm, warnaSkunder: e.target.value })} className="w-12 h-10" />
                          <Input type="text" value={temaForm.warnaSkunder} onChange={(e) => setTemaForm({ ...temaForm, warnaSkunder: e.target.value })} className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Warna Aksen</Label>
                        <div className="flex gap-2 mt-2">
                          <Input type="color" value={temaForm.warnaAccent} onChange={(e) => setTemaForm({ ...temaForm, warnaAccent: e.target.value })} className="w-12 h-10" />
                          <Input type="text" value={temaForm.warnaAccent} onChange={(e) => setTemaForm({ ...temaForm, warnaAccent: e.target.value })} className="flex-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Background Images</CardTitle>
                    <CardDescription>Upload hingga 3 gambar untuk transisi di beranda</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((num) => (
                      <div key={num}>
                        <Label>Gambar {num}</Label>
                        <Input
                          type="text"
                          placeholder="URL gambar background"
                          value={(temaForm as any)[`backgroundImage${num}`] || ""}
                          onChange={(e) => setTemaForm({ ...temaForm, [`backgroundImage${num}`]: e.target.value } as any)}
                          className="mt-2"
                        />
                      </div>
                    ))}

                    <div>
                      <Label>Kecepatan Animasi (detik)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={temaForm.backgroundAnimationSpeed}
                        onChange={(e) => setTemaForm({ ...temaForm, backgroundAnimationSpeed: parseInt(e.target.value || "0") || 5 })}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Logo</CardTitle>
                    <CardDescription>Atur logo website</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Logo Utama</Label>
                      <Input type="text" placeholder="URL logo" value={temaForm.logoUrl} onChange={(e) => setTemaForm({ ...temaForm, logoUrl: e.target.value })} className="mt-2" />
                    </div>
                    <div>
                      <Label>Logo Kecil</Label>
                      <Input type="text" placeholder="URL logo kecil" value={temaForm.logoKecilUrl} onChange={(e) => setTemaForm({ ...temaForm, logoKecilUrl: e.target.value })} className="mt-2" />
                    </div>
                    <div>
                      <Label>Favicon</Label>
                      <Input
                        type="text"
                        placeholder="URL favicon (SVG, PNG, atau ICO) - Contoh: /favicon.svg"
                        value={temaForm.faviconUrl}
                        onChange={(e) => setTemaForm({ ...temaForm, faviconUrl: e.target.value })}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-2">Format yang didukung: SVG, PNG, ICO.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bentuk & Layout</CardTitle>
                    <CardDescription>Atur border radius dan gaya tampilan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Border Radius</Label>
                      <Select value={temaForm.borderRadius} onValueChange={(value: any) => setTemaForm({ ...temaForm, borderRadius: normalizeBorderRadius(value) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tidak ada</SelectItem>
                          <SelectItem value="sm">Kecil</SelectItem>
                          <SelectItem value="md">Sedang</SelectItem>
                          <SelectItem value="lg">Besar</SelectItem>
                          <SelectItem value="full">Penuh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Header Submenu Custom</CardTitle>
                    <CardDescription>Atur warna atau class gradient (Tailwind) untuk background judul halaman</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Warna Background (Contoh: #047857 atau from-blue-700 to-indigo-700)</Label>
                      <div className="flex gap-2 mt-2">
                        {profilForm.headerBg.startsWith('#') && (
                          <Input 
                            type="color" 
                            value={profilForm.headerBg} 
                            onChange={(e) => setProfilForm({ ...profilForm, headerBg: e.target.value })} 
                            className="w-12 h-10" 
                          />
                        )}
                        <Input 
                          type="text" 
                          value={profilForm.headerBg} 
                          onChange={(e) => setProfilForm({ ...profilForm, headerBg: e.target.value })} 
                          className="flex-1" 
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => updateProfil.mutate({ header_submenu_bg: profilForm.headerBg } as any)}
                        disabled={updateProfil.isPending}
                        className="bg-emerald-700 hover:bg-emerald-800 mt-4"
                      >
                        {updateProfil.isPending ? "Menyimpan..." : "Simpan Header Submenu"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" disabled={updateTema.isPending} className="bg-emerald-700 hover:bg-emerald-800 w-full">
                  {updateTema.isPending ? "Menyimpan..." : "Simpan Perubahan Tema"}
                </Button>
              </form>
            )}
          </TabsContent>

          {/* DUSUN */}
          <TabsContent value="dusun" className="space-y-6">
            {dusunLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Manajemen Dusun/Lingkungan</h3>
                    <p className="text-sm text-gray-500">Total: {dusunList?.length || 0} dusun</p>
                  </div>
                  <Dialog
                    open={dusunDialogOpen}
                    onOpenChange={(open) => {
                      setDusunDialogOpen(open);
                      if (!open) {
                        setEditingDusunId(null);
                        setDusunForm({ nama: "", deskripsi: "", kepala: "", kontak: "", urutan: 0 });
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setEditingDusunId(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Dusun
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingDusunId ? "Edit Dusun" : "Tambah Dusun"}</DialogTitle>
                        <DialogDescription>
                          Atur informasi {editingDusunId ? "dusun/lingkungan" : "dusun/lingkungan baru"}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label>Nama Dusun</Label>
                          <Input value={dusunForm.nama} onChange={(e) => setDusunForm({ ...dusunForm, nama: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                          <Label>Deskripsi</Label>
                          <Textarea value={dusunForm.deskripsi} onChange={(e) => setDusunForm({ ...dusunForm, deskripsi: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                          <Label>Kepala Dusun</Label>
                          <Input value={dusunForm.kepala} onChange={(e) => setDusunForm({ ...dusunForm, kepala: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                          <Label>Kontak</Label>
                          <Input value={dusunForm.kontak} onChange={(e) => setDusunForm({ ...dusunForm, kontak: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                          <Label>Urutan</Label>
                          <Input
                            type="number"
                            value={dusunForm.urutan || 0}
                            onChange={(e) => setDusunForm({ ...dusunForm, urutan: parseInt(e.target.value || "0") || 0 })}
                            className="mt-2"
                          />
                        </div>

                        <Button
                          onClick={handleDusunSubmit}
                          disabled={createDusun.isPending || updateDusun.isPending}
                          className="bg-emerald-700 hover:bg-emerald-800 w-full"
                        >
                          {createDusun.isPending || updateDusun.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {dusunList && dusunList.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kepala</TableHead>
                            <TableHead>Kontak</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dusunList.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.nama}</TableCell>
                              <TableCell>{item.kepala || "-"}</TableCell>
                              <TableCell>{item.kontak || "-"}</TableCell>
                              <TableCell className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditDusun(item)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteDusun.mutate({ id: item.id })}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">Belum ada dusun</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* JABATAN */}
          <TabsContent value="jabatan" className="space-y-6">
            {jabatanLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Manajemen Pejabat Desa</h3>
                    <p className="text-sm text-gray-500">Total: {jabatanList?.length || 0} pejabat</p>
                  </div>

                  <Dialog
                    open={jabatanDialogOpen}
                    onOpenChange={(open) => {
                      setJabatanDialogOpen(open);
                      if (!open) {
                        setEditingJabatanId(null);
                        setJabatanForm({ nama: "", urutan: 0 });
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setEditingJabatanId(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Jabatan
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingJabatanId ? "Edit Jabatan" : "Tambah Jabatan"}</DialogTitle>
                        <DialogDescription>Atur nama jabatan desa/kelurahan</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label>Nama Jabatan</Label>
                          <Input
                            placeholder="Contoh: Kepala Desa"
                            value={jabatanForm.nama}
                            onChange={(e) => setJabatanForm({ ...jabatanForm, nama: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Urutan</Label>
                          <Input
                            type="number"
                            value={jabatanForm.urutan || 0}
                            onChange={(e) => setJabatanForm({ ...jabatanForm, urutan: parseInt(e.target.value || "0") || 0 })}
                            className="mt-2"
                          />
                        </div>

                        <Button
                          onClick={handleJabatanSubmit}
                          disabled={createJabatan.isPending || updateJabatan.isPending}
                          className="bg-emerald-700 hover:bg-emerald-800 w-full"
                        >
                          {createJabatan.isPending || updateJabatan.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {jabatanList && jabatanList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jabatanList.map((item: any) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-sm">{item.nama}</h3>
                          <p className="text-gray-700 text-sm">Urutan: {item.urutan ?? 0}</p>
                          <div className="flex gap-2 mt-4">
                            <Button variant="ghost" size="sm" onClick={() => handleEditJabatan(item)} className="flex-1">
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteJabatan.mutate({ id: item.id })}
                              className="flex-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Hapus
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">Belum ada jabatan</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* RUNNING TEXT */}
          <TabsContent value="running-text" className="space-y-6">
            {runningTextLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Manajemen Running Text</h3>
                    <p className="text-sm text-gray-500">Total: {runningTextList?.length || 0} teks</p>
                  </div>

                  <Dialog
                    open={runningTextDialogOpen}
                    onOpenChange={(open) => {
                      setRunningTextDialogOpen(open);
                      if (!open) {
                        setEditingRunningTextId(null);
                        setRunningTextForm({
                          teks: "",
                          warna: "#ffffff",
                          backgroundColor: "#dc2626",
                          kecepatan: 50,
                          aktif: 1,
                          urutan: 0,
                        });
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setEditingRunningTextId(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Teks
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingRunningTextId ? "Edit Running Text" : "Tambah Running Text"}</DialogTitle>
                        <DialogDescription>Buat teks yang berjalan di bagian atas website</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label>Teks</Label>
                          <Textarea
                            value={runningTextForm.teks}
                            onChange={(e) => setRunningTextForm({ ...runningTextForm, teks: e.target.value })}
                            className="mt-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Warna Teks</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="color"
                                value={runningTextForm.warna}
                                onChange={(e) => setRunningTextForm({ ...runningTextForm, warna: e.target.value })}
                                className="w-12 h-10"
                              />
                              <Input
                                type="text"
                                value={runningTextForm.warna}
                                onChange={(e) => setRunningTextForm({ ...runningTextForm, warna: e.target.value })}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Warna Background</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="color"
                                value={runningTextForm.backgroundColor}
                                onChange={(e) => setRunningTextForm({ ...runningTextForm, backgroundColor: e.target.value })}
                                className="w-12 h-10"
                              />
                              <Input
                                type="text"
                                value={runningTextForm.backgroundColor}
                                onChange={(e) => setRunningTextForm({ ...runningTextForm, backgroundColor: e.target.value })}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Kecepatan (px/s)</Label>
                            <Input
                              type="number"
                              min="10"
                              max="200"
                              value={runningTextForm.kecepatan}
                              onChange={(e) => setRunningTextForm({ ...runningTextForm, kecepatan: parseInt(e.target.value || "0") || 50 })}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Urutan</Label>
                            <Input
                              type="number"
                              value={runningTextForm.urutan}
                              onChange={(e) => setRunningTextForm({ ...runningTextForm, urutan: parseInt(e.target.value || "0") || 0 })}
                              className="mt-2"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={runningTextForm.aktif === 1}
                            onChange={(e) => setRunningTextForm({ ...runningTextForm, aktif: e.target.checked ? 1 : 0 })}
                            className="rounded"
                          />
                          <Label className="cursor-pointer">Aktif</Label>
                        </div>

                        <Button
                          onClick={handleRunningTextSubmit}
                          disabled={createRunningText.isPending || updateRunningText.isPending}
                          className="bg-emerald-700 hover:bg-emerald-800 w-full"
                        >
                          {createRunningText.isPending || updateRunningText.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {runningTextList && runningTextList.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Teks</TableHead>
                            <TableHead>Warna</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {runningTextList.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="max-w-xs truncate">{item.teks}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded" style={{ backgroundColor: item.backgroundColor }} />
                                  <span className="text-sm text-gray-600">{item.backgroundColor}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    item.aktif === 1
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {item.aktif === 1 ? "Aktif" : "Nonaktif"}
                                </span>
                              </TableCell>
                              <TableCell className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditRunningText(item)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteRunningText.mutate({ id: item.id })}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">Belum ada running text</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* LAYANAN MANDIRI */}
          <TabsContent value="layanan-mandiri" className="space-y-6">
            <form onSubmit={handleLayananSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Layanan Mandiri Masyarakat</CardTitle>
                  <CardDescription>Atur link eksternal menuju platform layanan mandiri masyarakat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>URL Layanan Mandiri</Label>
                    <Input
                      type="url"
                      placeholder="Contoh: https://layanan.desa.id"
                      value={profilForm.layananUrl}
                      onChange={(e) => setProfilForm({ ...profilForm, layananUrl: e.target.value })}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">Link ini akan digunakan pada tombol "Buka Layanan Mandiri" di halaman Layanan Publik.</p>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={updateProfil.isPending} className="bg-emerald-700 hover:bg-emerald-800 w-full">
                {updateProfil.isPending ? "Menyimpan..." : "Simpan Perubahan Link"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

