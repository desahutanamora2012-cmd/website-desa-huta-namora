import { trpc } from "@/providers/trpc";
import { useEffect, useState } from "react";

interface SubmenuHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SubmenuHeader({ title, subtitle }: SubmenuHeaderProps) {
  const { data: profil } = trpc.desa.profil.list.useQuery();
  const [bgClass, setBgClass] = useState("bg-gradient-to-br from-emerald-700 to-teal-700");

  useEffect(() => {
    if (profil?.header_submenu_bg) {
      const bg = profil.header_submenu_bg;
      if (bg.startsWith("#")) {
        setBgClass(""); // Will use inline style instead
      } else {
        // Assume it's a tailwind class like "from-blue-700 to-indigo-700"
        setBgClass(bg.includes("bg-") || bg.includes("from-") ? bg : `bg-${bg}`);
      }
    }
  }, [profil?.header_submenu_bg]);

  const customStyle = profil?.header_submenu_bg?.startsWith("#")
    ? { backgroundColor: profil.header_submenu_bg }
    : {};

  // If bgClass is just "from-blue-700 to-indigo-700", we should prepend "bg-gradient-to-br"
  const finalClass = bgClass && (bgClass.includes("from-") || bgClass.includes("to-")) && !bgClass.includes("bg-gradient")
    ? `bg-gradient-to-br ${bgClass}`
    : bgClass;

  return (
    <div 
      className={`text-white py-6 shadow-inner ${finalClass}`}
      style={customStyle}
    >
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-white/90 mt-1 text-sm md:text-base font-medium max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
