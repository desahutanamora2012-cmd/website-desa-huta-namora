import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";

export default function BackgroundCarousel() {
  const { data: temaWebsite } = trpc.desa.tema.temaWebsite.list.useQuery();

  const tema = Array.isArray(temaWebsite) ? temaWebsite[0] : temaWebsite;


  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    tema?.backgroundImage1,
    tema?.backgroundImage2,
    tema?.backgroundImage3,
  ].filter(Boolean);

  const animationSpeed = tema?.backgroundAnimationSpeed || 5;

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, animationSpeed * 1000);

    return () => clearInterval(interval);
  }, [images.length, animationSpeed]);

  if (!images || images.length === 0) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920')`,
        }}
      />
    );
  }

  return (
    <>
      {images.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${image}')`,
            opacity: index === currentImageIndex ? 0.2 : 0,
          }}
        />
      ))}
    </>
  );
}
