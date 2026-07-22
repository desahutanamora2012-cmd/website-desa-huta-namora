import { useEffect } from "react";
import { trpc } from "@/providers/trpc";

/**
 * Hook to dynamically set page title and favicon based on desa settings
 * Title format: "Website [nama_desa] - Pardomuan"
 * Favicon: From temaWebsite.faviconUrl or default /favicon.svg
 */
export function useSiteMetadata() {
  const { data: profilData, isLoading: isLoadingProfil } = trpc.desa.profil.list.useQuery();
  const { data: temaWebsite, isLoading: isLoadingTema } = trpc.desa.tema.temaWebsite.list.useQuery();
  const temaData = Array.isArray(temaWebsite) ? temaWebsite[0] : temaWebsite;

  useEffect(() => {
    if (!profilData) return;

    // Get nama desa from profil (profil.list returns Record<string, string>)
    const namaDesa = profilData["nama_desa"] || "Desa";

    // Set document title
    const pageTitle = `Website ${namaDesa} - Pardomuan`;
    document.title = pageTitle;

    // Update meta tags for better SEO
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content",
      `Website resmi ${namaDesa}. Platform digital untuk informasi, layanan, dan transparansi pemerintahan desa.`
    );
  }, [profilData]);

  // Set favicon
  useEffect(() => {
    if (!temaData) return;

    const faviconUrl = temaData.faviconUrl || "/favicon.svg";

    // Update or create favicon link
    let faviconLink = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement | null;

    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.rel = "icon";
      document.head.appendChild(faviconLink);
    }

    // Determine type based on URL
    if (faviconUrl.endsWith(".svg")) {
      faviconLink.type = "image/svg+xml";
    } else if (faviconUrl.endsWith(".png")) {
      faviconLink.type = "image/png";
    } else if (faviconUrl.endsWith(".ico")) {
      faviconLink.type = "image/x-icon";
    }

    faviconLink.href = faviconUrl;
  }, [temaData]);

  return {
    namaDesa: profilData?.["nama_desa"],
    faviconUrl: temaData?.faviconUrl,
    isLoading: isLoadingProfil || isLoadingTema,
  };
}
