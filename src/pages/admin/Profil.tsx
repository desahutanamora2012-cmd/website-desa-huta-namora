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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Settings,
  MapPin,
  Phone,
  Share2,
  RotateCcw,
  ThermometerSun,
  Droplets,
  Wind,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function safeParseJson<T = any>(raw: string, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function extractLatLonFromGeografis(geografisRaw: string): { lat?: number; lon?: number } {
  const g = safeParseJson<Record<string, any>>(geografisRaw, {});
  const candidates: Array<[string, string]> = [
    ["latitude", "longitude"],
    ["lat", "lon"],
    ["lat", "lng"],
    ["koordinat_lat", "koordinat_lon"],
    ["koordinat", "koordinat"],
  ];

  // direct candidates
  for (const [latKey, lonKey] of candidates) {
    const latVal = g?.[latKey];
    const lonVal = g?.[lonKey];
    if (latVal !== undefined && lonVal !== undefined) {
      const latNum = typeof latVal === "string" ? Number(latVal) : latVal;
      const lonNum = typeof lonVal === "string" ? Number(lonVal) : lonVal;
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        return { lat: latNum, lon: lonNum };
      }
    }
  }

  // nested iklim
  const iklim = g?.iklim;
  if (iklim && typeof iklim === "object") {
    const latVal = iklim?.lat ?? iklim?.latitude;
    const lonVal = iklim?.lon ?? iklim?.longitude ?? iklim?.lng;
    const latNum = typeof latVal === "string" ? Number(latVal) : latVal;
    const lonNum = typeof lonVal === "string" ? Number(lonVal) : lonVal;
    if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
      return { lat: latNum, lon: lonNum };
    }
  }

  return {};
}

function weatherCodeToText(code: number | null | undefined) {
  const c = code ?? 0;
  // Open-Meteo: https://open-meteo.com/en/docs
  if (c === 0) return "Cerah";
  if (c === 1) return "Utamanya cerah";
  if (c === 2) return "Sedikit berawan";
  if (c === 3) return "Berawan";
  if (c === 45 || c === 48) return "Kabut";
  if (c >= 51 && c <= 57) return "Gerimis";
  if (c >= 61 && c <= 67) return "Hujan ringan";
  if (c >= 71 && c <= 77) return "Salju/Es";
  if (c >= 80 && c <= 82) return "Hujan deras";
  if (c >= 85 && c <= 86) return "Hujan salju/Es";
  if (c >= 95) return "Petir";
  return "Cuaca";
}

export default function AdminProfil() {
  const utils = trpc.useUtils();
  const { data: profil, isLoading } = trpc.desa.profil.list.useQuery();

  const setProfil = trpc.desa.profil.setMany.useMutation({
    onSuccess: (_data, variables) => {
      utils.desa.profil.list.setData(undefined, (prev: Record<string, string> | undefined) => ({
        ...(prev ?? {}),
        ...(variables as Record<string, string>),
      }));
      utils.desa.profil.list.invalidate();
      toast.success("Profil desa berhasil diperbarui!");
    },
    onError: () => toast.error("Gagal menyimpan perubahan"),
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [climate, setClimate] = useState<{
    loading: boolean;
    error?: string;
    data?: {
      temperature_2m: number;
      apparent_temperature: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
      weather_code: number;
    };
    lastUpdated?: string;
  }>({ loading: false });

  const [medsosList, setMedsosList] = useState<{platform: string, url: string}[]>([]);

  const [manualLat, setManualLat] = useState<string>("");
  const [manualLon, setManualLon] = useState<string>("");

  useEffect(() => {
    if (!profil) return;

    // Extract existing lat/lon (if available) from geografis JSON,
    // so the dedicated inputs are prefilled.
    const { lat, lon } = extractLatLonFromGeografis(
      profil.geografis || "{}"
    );

    setManualLat(lat !== undefined ? String(lat) : "");
    setManualLon(lon !== undefined ? String(lon) : "");

    const parsedMedsos = safeParseJson<Record<string, string>>(profil.medsos || "{}", {});
    setMedsosList(
      Object.entries(parsedMedsos).map(([k, v]) => ({
        platform: k,
        url: v,
      }))
    );

    setForm({
      nama_desa: profil.nama_desa || "",
      kecamatan: profil.kecamatan || "",
      kabupaten: profil.kabupaten || "",
      provinsi: profil.provinsi || "",
      kode_pos: profil.kode_pos || "",
      visi: profil.visi || "",
      misi: profil.misi || "[]",
      sejarah: profil.sejarah || "",
      geografis: profil.geografis || "{}",
      kontak_wa: profil.kontak_wa || "",
      kontak_email: profil.kontak_email || "",
      kontak_telepon: profil.kontak_telepon || "",
      medsos: profil.medsos || "{}",
      google_maps_embed: profil.google_maps_embed || "",
      footer_teks: profil.footer_teks || "",
      footer_logo_url: profil.footer_logo_url || "",
      layanan_mandiri_url: profil.layanan_mandiri_url || "",
      logo_url: profil.logo_url || "",
    });
  }, [profil]);

  useEffect(() => {
    const lat = Number(manualLat);
    const lon = Number(manualLon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      // Avoid overlapping fetches if current request still loading
      if (climate.loading) return;
      await fetchClimate(lat, lon);
    };

    // fetch once immediately
    run();

    const id = window.setInterval(() => {
      run();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualLat, manualLon]); // Removed climate.loading to prevent infinite loop and flickering

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist dedicated lat/lon into geografis JSON
    const lat = manualLat.trim() !== "" ? Number(manualLat) : undefined;
    const lon = manualLon.trim() !== "" ? Number(manualLon) : undefined;

    const hasValidLatLon =
      lat !== undefined &&
      lon !== undefined &&
      Number.isFinite(lat) &&
      Number.isFinite(lon);

    const nextForm: Record<string, string> = { ...form };

    // Serialize medsosList back to JSON
    const medsosObj = medsosList.reduce((acc, curr) => {
      if (curr.platform && curr.url) {
        acc[curr.platform.toLowerCase()] = curr.url;
      }
      return acc;
    }, {} as Record<string, string>);
    nextForm.medsos = JSON.stringify(medsosObj);

    if (hasValidLatLon) {
      nextForm.geografis = JSON.stringify({
        latitude: lat,
        longitude: lon,
      });
    }

    setProfil.mutate(nextForm);
  };

  const fetchClimate = async (lat: number, lon: number) => {
    try {
      setClimate({ loading: true, error: undefined });

      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(lat));
      url.searchParams.set("longitude", String(lon));
      url.searchParams.set(
        "current",
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m"
      );
      url.searchParams.set("timezone", "Asia/Singapore");

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();

      const cur = json?.current;
      if (!cur) throw new Error("Response cuaca tidak valid");

      setClimate({
        loading: false,
        data: {
          temperature_2m: Number(cur.temperature_2m),
          apparent_temperature: Number(cur.apparent_temperature),
          relative_humidity_2m: Number(cur.relative_humidity_2m),
          wind_speed_10m: Number(cur.wind_speed_10m),
          wind_direction_10m: Number(cur.wind_direction_10m),
          weather_code: Number(cur.weather_code),
        },
        lastUpdated: new Date().toLocaleString(),
      });
    } catch (err: any) {
      setClimate({
        loading: false,
        error: err?.message || "Gagal memuat cuaca",
      });
      toast.error("Gagal memuat cuaca realtime");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kelola Profil Desa
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Atur informasi umum tentang desa
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={setProfil.isPending}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {setProfil.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="umum" className="space-y-6">
            <TabsList>
              <TabsTrigger value="umum">
                <Settings className="w-3 h-3 mr-1" />
                Umum
              </TabsTrigger>
              <TabsTrigger value="kontak">
                <Phone className="w-3 h-3 mr-1" />
                Kontak
              </TabsTrigger>
              <TabsTrigger value="media">
                <Share2 className="w-3 h-3 mr-1" />
                Media
              </TabsTrigger>
              <TabsTrigger value="lokasi">
                <MapPin className="w-3 h-3 mr-1" />
                Lokasi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="umum">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nama Desa</Label>
                      <Input
                        value={form.nama_desa || ""}
                        onChange={(e) =>
                          setForm({ ...form, nama_desa: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Kecamatan</Label>
                      <Input
                        value={form.kecamatan || ""}
                        onChange={(e) =>
                          setForm({ ...form, kecamatan: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Kabupaten</Label>
                      <Input
                        value={form.kabupaten || ""}
                        onChange={(e) =>
                          setForm({ ...form, kabupaten: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Provinsi</Label>
                      <Input
                        value={form.provinsi || ""}
                        onChange={(e) =>
                          setForm({ ...form, provinsi: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Kode Pos</Label>
                      <Input
                        value={form.kode_pos || ""}
                        onChange={(e) =>
                          setForm({ ...form, kode_pos: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Logo URL</Label>
                      <Input
                        value={form.logo_url || ""}
                        onChange={(e) =>
                          setForm({ ...form, logo_url: e.target.value })
                        }
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Visi</Label>
                    <Textarea
                      value={form.visi || ""}
                      onChange={(e) =>
                        setForm({ ...form, visi: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Misi (format JSON array)</Label>
                    <Textarea
                      value={form.misi || "[]"}
                      onChange={(e) =>
                        setForm({ ...form, misi: e.target.value })
                      }
                      rows={5}
                      placeholder='["Misi 1", "Misi 2"]'
                    />
                  </div>
                  <div>
                    <Label>Sejarah Desa</Label>
                    <Textarea
                      value={form.sejarah || ""}
                      onChange={(e) =>
                        setForm({ ...form, sejarah: e.target.value })
                      }
                      rows={8}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kontak">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>WhatsApp</Label>
                      <Input
                        value={form.kontak_wa || ""}
                        onChange={(e) =>
                          setForm({ ...form, kontak_wa: e.target.value })
                        }
                        placeholder="628123456789"
                      />
                    </div>
                    <div>
                      <Label>Telepon</Label>
                      <Input
                        value={form.kontak_telepon || ""}
                        onChange={(e) =>
                          setForm({ ...form, kontak_telepon: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.kontak_email || ""}
                      onChange={(e) =>
                        setForm({ ...form, kontak_email: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Media Sosial</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setMedsosList([...medsosList, { platform: "facebook", url: "" }])}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Media Sosial
                      </Button>
                    </div>
                    {medsosList.length === 0 && (
                      <p className="text-sm text-gray-500 italic py-2">Belum ada media sosial ditambahkan.</p>
                    )}
                    <div className="space-y-3">
                      {medsosList.map((m, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-gray-50 p-2 rounded-lg border">
                          <select 
                            className="flex h-10 w-1/3 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={m.platform}
                            onChange={(e) => {
                              const newList = [...medsosList];
                              newList[idx].platform = e.target.value;
                              setMedsosList(newList);
                            }}
                          >
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                            <option value="twitter">X / Twitter</option>
                            <option value="tiktok">TikTok</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="telegram">Telegram</option>
                            <option value="lainnya">Lainnya</option>
                          </select>
                          <Input 
                            className="flex-1"
                            placeholder="https://..." 
                            value={m.url}
                            onChange={(e) => {
                              const newList = [...medsosList];
                              newList[idx].url = e.target.value;
                              setMedsosList(newList);
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setMedsosList(medsosList.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Footer Teks BPS</Label>
                    <Textarea
                      value={form.footer_teks || ""}
                      onChange={(e) =>
                        setForm({ ...form, footer_teks: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Footer Logo URL</Label>
                    <Input
                      value={form.footer_logo_url || ""}
                      onChange={(e) =>
                        setForm({ ...form, footer_logo_url: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lokasi">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  {/* Realtime Climate */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          Iklim (Realtime)
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Data diambil realtime dari Open‑Meteo (gratis) berdasarkan koordinat desa.
                        </p>
                      </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                      <div className="bg-white rounded-lg border border-emerald-100 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ThermometerSun className="w-4 h-4 text-emerald-700" />
                          Suhu
                        </div>
                        <div className="text-4xl font-bold text-gray-900 leading-none mt-1">
                          {climate.data?.temperature_2m !== undefined
                            ? `${Math.round(
                                climate.data.temperature_2m
                              )}°C`
                            : climate.loading
                              ? "—"
                              : "—"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {climate.data?.weather_code !== undefined
                            ? weatherCodeToText(climate.data.weather_code)
                            : ""}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-emerald-100 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Droplets className="w-4 h-4 text-emerald-700" />
                          Kelembapan
                        </div>
                        <div className="text-2xl font-semibold text-gray-900 mt-1">
                          {climate.data?.relative_humidity_2m !== undefined
                            ? `${Math.round(climate.data.relative_humidity_2m)}%`
                            : "—"}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {climate.data
                            ? `Sensasi: ${Math.round(
                                climate.data.apparent_temperature
                              )}°C`
                            : ""}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-emerald-100 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Wind className="w-4 h-4 text-emerald-700" />
                          Angin
                        </div>
                        <div className="text-2xl font-semibold text-gray-900 mt-1">
                          {climate.data?.wind_speed_10m !== undefined
                            ? `${Math.round(
                                climate.data.wind_speed_10m
                              )} km/jam`
                            : "—"}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {climate.data?.wind_direction_10m !== undefined
                            ? `Arah: ${Math.round(
                                climate.data.wind_direction_10m
                              )}°`
                            : ""}
                        </div>
                      </div>
                    </div>

                    {climate.error && (
                      <div className="mt-3 text-sm text-red-600">
                        {climate.error}
                      </div>
                    )}


                    {/* Manual lat/lon fallback (opsional) */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div>
                        <Label>Lat (opsional)</Label>
                        <Input
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          placeholder="e.g. 2.1234"
                        />
                      </div>
                      <div>
                        <Label>Lon (opsional)</Label>
                        <Input
                          value={manualLon}
                          onChange={(e) => setManualLon(e.target.value)}
                          placeholder="e.g. 99.5678"
                        />
                      </div>
                      <div className="flex justify-start md:justify-end">
                        <Button
                          type="button"
                          variant="default"
                          className="bg-emerald-700 hover:bg-emerald-800"
                          onClick={() => {
                            const lat = Number(manualLat);
                            const lon = Number(manualLon);
                            if (Number.isFinite(lat) && Number.isFinite(lon)) {
                              fetchClimate(lat, lon);
                              return;
                            }
                            toast.error("Masukkan lat/lon yang valid untuk memuat cuaca.");
                          }}
                          disabled={climate.loading}
                        >
                          Ambil Cuaca
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Data Geografis (JSON)</Label>
                    <Textarea
                      value={form.geografis || "{}"}
                      onChange={(e) =>
                        setForm({ ...form, geografis: e.target.value })
                      }
                      rows={10}
                      placeholder='{"luas": "", "ketinggian": "", "iklim": "", "latitude": -2.1234, "longitude": 99.5678}'
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Disarankan isi: <span className="font-mono">latitude</span> dan{" "}
                      <span className="font-mono">longitude</span> (atau lat/lon) di JSON agar cuaca otomatis.
                    </p>
                  </div>

                  <div>
                    <Label>Link Google Maps Kantor Desa</Label>
                    <Textarea
                      value={form.google_maps_embed || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          google_maps_embed: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Masukkan URL / Link Google Maps"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Salin link dari Google Maps (misal: https://maps.app.goo.gl/... atau link embed)
                    </p>
                  </div>

                  <div>
                    <Label>URL Layanan Mandiri</Label>
                    <Input
                      value={form.layanan_mandiri_url || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          layanan_mandiri_url: e.target.value,
                        })
                      }
                      placeholder="https://"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </AdminLayout>
  );
}
