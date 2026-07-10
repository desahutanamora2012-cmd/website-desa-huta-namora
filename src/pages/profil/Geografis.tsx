import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPin,
  Mountain,
  Thermometer,
  Compass,
  Navigation,
  Ruler,
  RotateCcw,
  Map,
} from "lucide-react";

function getGoogleMapsEmbedUrl(input: string, fallbackQuery: string): string {
  if (!input) return "";
  if (input.includes("<iframe")) {
    const match = input.match(/src="([^"]+)"/);
    return match ? match[1] : "";
  }
  if (input.includes("/embed") || input.includes("output=embed")) {
    return input;
  }
  
  let query = input;
  if (input.startsWith("http")) {
    const placeMatch = input.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      query = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    } else {
      const coordMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        query = `${coordMatch[1]},${coordMatch[2]}`;
      } else {
        query = fallbackQuery;
      }
    }
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

function safeParseJson<T = any>(raw: string, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function extractLatLonFromGeografis(
  geografisRaw: string
): { lat?: number; lon?: number } {
  const g = safeParseJson<Record<string, any>>(geografisRaw, {});

  const toNum = (v: unknown) => {
    if (v === null || v === undefined) return undefined;
    const n = typeof v === "string" ? Number(v) : (v as number);
    return Number.isFinite(n) ? n : undefined;
  };

  const tryPairs = (
    obj: Record<string, any> | undefined
  ): { lat?: number; lon?: number } | undefined => {
    if (!obj) return undefined;

    const candidates: Array<[string, string]> = [
      ["latitude", "longitude"],
      ["lat", "lon"],
      ["lat", "lng"],
      ["LATITUDE", "LONGITUDE"],
      ["LAT", "LON"],
      ["koordinat_lat", "koordinat_lon"],
      ["koordinatLat", "koordinatLon"],
      ["koordinat_latitude", "koordinat_longitude"],
    ];

    for (const [latKey, lonKey] of candidates) {
      const lat = toNum(obj?.[latKey]);
      const lon = toNum(obj?.[lonKey]);
      if (lat !== undefined && lon !== undefined) return { lat, lon };
    }

    return undefined;
  };

  // 1) top-level keys
  const direct = tryPairs(g);
  if (direct && direct.lat !== undefined && direct.lon !== undefined)
    return direct;

  // 2) nested iklim object
  const iklim = g?.iklim;
  const fromIklim = tryPairs(iklim);
  if (fromIklim?.lat !== undefined && fromIklim?.lon !== undefined)
    return fromIklim;

  // 3) nested koordinat object (common variants)
  const koordinat = g?.koordinat ?? g?.coordinate;
  const fromKoordinat = tryPairs(koordinat);
  if (fromKoordinat?.lat !== undefined && fromKoordinat?.lon !== undefined)
    return fromKoordinat;

  // 4) fallback: try reading any { lat, lon } shape
  const lat = toNum(
    g?.lat ??
      g?.latitude ??
      g?.iklim?.lat ??
      g?.iklim?.latitude ??
      g?.koordinat?.lat ??
      g?.koordinat?.latitude
  );
  const lon = toNum(
    g?.lon ??
      g?.lng ??
      g?.longitude ??
      g?.iklim?.lon ??
      g?.iklim?.lng ??
      g?.iklim?.longitude ??
      g?.koordinat?.lon ??
      g?.koordinat?.lng ??
      g?.koordinat?.longitude
  );

  if (lat !== undefined && lon !== undefined) return { lat, lon };
  return {};
}

function weatherCodeToText(code: number | null | undefined) {
  const c = code ?? 0;
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

export default function GeografisPage() {
  const { data: profil } = trpc.desa.profil.list.useQuery();
  const { data: statistik } = trpc.desa.statistik.getLatest.useQuery();

  const geografisRaw = profil?.geografis || "{}";
  const geografis: Record<string, string> = useMemo(
    () => safeParseJson<Record<string, string>>(geografisRaw, {}),
    [geografisRaw]
  );

  const namaDesa = profil?.nama_desa || "Desa";
  const kecamatan = profil?.kecamatan || "Kecamatan";
  const kabupaten = profil?.kabupaten || "Kabupaten";
  const googleMapsEmbed = profil?.google_maps_embed || "";

  const coords = useMemo(
    () => extractLatLonFromGeografis(geografisRaw),
    [geografisRaw]
  );

  const abortRef = useRef<AbortController | null>(null);

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

  const fetchClimate = async (lat: number, lon: number) => {
    try {
      setClimate({ loading: true, error: undefined });

      // cancel previous request (if any)
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(lat));
      url.searchParams.set("longitude", String(lon));
      url.searchParams.set(
        "current",
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m"
      );
      url.searchParams.set("timezone", "Asia/Singapore");

      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
      // ignore abort (network change / unmount)
      if (err?.name === "AbortError") return;

      setClimate({
        loading: false,
        error: err?.message || "Gagal memuat cuaca",
      });
    }
  };

  useEffect(() => {
    // cleanup on unmount
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (coords.lat !== undefined && coords.lon !== undefined) {
      fetchClimate(coords.lat, coords.lon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords.lat, coords.lon]);

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Kondisi Geografis</h1>
          <p className="text-emerald-100 mt-2">
            Informasi geografis dan karakteristik wilayah {namaDesa}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Statistik Geografis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Ruler className="h-6 w-6 text-emerald-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {statistik?.luasWilayah || "0"}
              </p>
              <p className="text-xs text-gray-500">Hektar Luas Wilayah</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-blue-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {statistik?.jumlahDusun || "0"}
              </p>
              <p className="text-xs text-gray-500">Jumlah Dusun</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Navigation className="h-6 w-6 text-orange-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {statistik?.jumlahRT || "0"}
              </p>
              <p className="text-xs text-gray-500">Jumlah RT</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Compass className="h-6 w-6 text-purple-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {statistik?.jumlahRW || "0"}
              </p>
              <p className="text-xs text-gray-500">Jumlah RW</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Detail Geografis */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                Detail Wilayah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Compass className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      Batas Wilayah
                    </p>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Utara:</span>{" "}
                        {geografis.batas_utara || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Selatan:</span>{" "}
                        {geografis.batas_selatan || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Barat:</span>{" "}
                        {geografis.batas_barat || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Timur:</span>{" "}
                        {geografis.batas_timur || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mountain className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      Ketinggian
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {geografis.ketinggian || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Thermometer className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div className="w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          Iklim
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {climate.data?.temperature_2m !== undefined ? (
                            <>
                              {Math.round(climate.data.temperature_2m)}°C —{" "}
                              {weatherCodeToText(
                                climate.data.weather_code
                              )}
                            </>
                          ) : climate.loading ? (
                            "Memuat cuaca..."
                          ) : (
                            geografis.iklim || "-"
                          )}
                        </p>
                      </div>
                    </div>

                    {climate.error && (
                      <p className="text-xs text-red-600 mt-2">
                        {climate.error}
                      </p>
                    )}

                    {climate.data && (
                      <div className="mt-2 text-xs text-gray-500">
                        Kelembapan:{" "}
                        {Math.round(climate.data.relative_humidity_2m)}%{" "}
                        {" "}· Angin: {Math.round(climate.data.wind_speed_10m)} km/jam
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {/* Map / Google Maps embed */}
                  {googleMapsEmbed ? (
                    <div className="rounded-xl overflow-hidden border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center gap-2">
                        <Map className="w-4 h-4 text-emerald-700" />
                        <span className="text-sm font-semibold text-emerald-900">Peta Interaktif</span>
                      </div>
                      <iframe
                        src={getGoogleMapsEmbedUrl(googleMapsEmbed, `Kantor Desa ${namaDesa}, ${kecamatan}, ${kabupaten}`)}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Peta ${namaDesa}`}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-200">
                      <Map className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">
                        Peta lokasi belum ditambahkan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card kanan / informasi tambahan */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-700" />
                Informasi Tambahan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Nama Desa:</span>{" "}
                  {namaDesa}
                </p>
                <p>
                  <span className="font-medium">Kecamatan:</span>{" "}
                  {kecamatan}
                </p>
                <p>
                  <span className="font-medium">Kabupaten:</span>{" "}
                  {kabupaten}
                </p>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Informasi lanjutan bisa ditampilkan di sini.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}





