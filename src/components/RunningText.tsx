import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { VisitorWidget } from "./VisitorWidget";

export default function RunningText() {
  const { data: runningTextList } = trpc.desa.runningText.list.useQuery();
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    if (!runningTextList || runningTextList.length === 0) return;

    const interval = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % runningTextList.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [runningTextList]);

  if (!runningTextList || runningTextList.length === 0) return null;

  const current = runningTextList[displayIndex];
  const bg = current.backgroundColor || "#dc2626";
  const fg = current.warna || "#ffffff";
  const durationSeconds = (100 / (current.kecepatan || 50)) * 10;

  return (
    <div
      className="sticky bottom-0 z-50 w-full overflow-hidden relative"
      style={{ backgroundColor: bg, display: "flex", flexDirection: "row" }}
    >
      <VisitorWidget backgroundColor={bg} textColor={fg} />

      <div className="flex-1 overflow-hidden">
        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }

          .running-text-container {
            animation: scroll-left ${durationSeconds}s linear infinite;
            white-space: nowrap;
            display: inline-block;
            padding: 12px 20px;
          }

          .running-text-container:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="w-full">
          <div
            className="running-text-container"
            style={{
              color: fg,
              fontSize: "15px",
              fontWeight: "500",
            }}
          >
            📢 {current.teks}
          </div>
        </div>
      </div>
    </div>
  );
}
