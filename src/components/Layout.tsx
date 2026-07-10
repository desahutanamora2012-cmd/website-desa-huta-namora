import { useEffect, type ReactNode } from "react";
import { trpc } from "@/providers/trpc";
import Navbar from "./Navbar";
import RunningText from "./RunningText";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";

interface LayoutProps {
  children: ReactNode;
}

function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export default function Layout({ children }: LayoutProps) {
  const { data: temaWebsite } = trpc.desa.tema.temaWebsite.list.useQuery();
  const tema = Array.isArray(temaWebsite) ? temaWebsite[0] : temaWebsite;

  useEffect(() => {
    if (tema) {
      if (tema.warnaPrimer) {
        document.documentElement.style.setProperty('--primary', hexToHSL(tema.warnaPrimer));
      }
      if (tema.warnaAccent) {
        document.documentElement.style.setProperty('--accent', hexToHSL(tema.warnaAccent));
      }
      if (tema.warnaSkunder) {
        document.documentElement.style.setProperty('--secondary', hexToHSL(tema.warnaSkunder));
      }
    }
  }, [tema]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50/50">
      <Navbar />
      <main className="flex-1 pb-0">{children}</main>
      <Footer />
      <FloatingContact />
      <RunningText />
    </div>
  );
}
