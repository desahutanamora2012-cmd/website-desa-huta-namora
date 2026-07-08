import { useMemo } from "react";
import { trpc } from "@/providers/trpc";

export function useDesaStatus() {
  const { data: temaWebsite } = trpc.desa.tema.temaWebsite.list.useQuery();

  const statusDesa = (Array.isArray(temaWebsite) ? temaWebsite[0] : temaWebsite)?.statusDesa || "desa";


  const labels = useMemo(
    () => ({
      statusDesa: statusDesa,
      namaBadan:
        statusDesa === "kelurahan"
          ? "Pemerintah Kelurahan"
          : "Pemerintah Desa",
      namaKepala: statusDesa === "kelurahan" ? "Lurah" : "Kepala Desa",
      namaPerangkat:
        statusDesa === "kelurahan"
          ? "Perangkat Kelurahan"
          : "Perangkat Desa",
      namaWilayah:
        statusDesa === "kelurahan" ? "Lingkungan" : "Dusun",
      namaWilayahPlural:
        statusDesa === "kelurahan" ? "Lingkungan-lingkungan" : "Dusun-dusun",
      namaPemerintahan:
        statusDesa === "kelurahan"
          ? "Pemerintahan Kelurahan"
          : "Pemerintahan Desa",
    }),
    [statusDesa]
  );

  return {
    statusDesa,
    labels,
    isDesa: statusDesa === "desa",
    isKelurahan: statusDesa === "kelurahan",
  };
}

// Helper function to replace desa with appropriate term
export function getReplaceDesaTerm(
  text: string,
  statusDesa: "desa" | "kelurahan"
): string {
  if (statusDesa === "kelurahan") {
    return text
      .replace(/\bPemerintah Desa\b/g, "Pemerintah Kelurahan")
      .replace(/\bPerangkat Desa\b/g, "Perangkat Kelurahan")
      .replace(/\bKepala Desa\b/g, "Lurah")
      .replace(/\bSekretaris Desa\b/g, "Sekretaris Lurah")
      .replace(/\bKepala Dusun\b/g, "Kepala Lingkungan")
      .replace(/\bDusun\b/g, "Lingkungan")
      .replace(/\bDesa\b/g, "Kelurahan");
  }
  return text;
}
