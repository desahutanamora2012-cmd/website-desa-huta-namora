import { Eye } from "lucide-react";
import { useEffect } from "react";
import { trpc } from "@/providers/trpc";

type VisitorWidgetProps = {
  backgroundColor?: string;
  textColor?: string;
};

export function VisitorWidget({
  backgroundColor = "#dc2626",
  textColor = "#ffffff",
}: VisitorWidgetProps) {
  const { data, refetch } = trpc.desa.dashboard.visitsTotal.useQuery();
  const track = trpc.desa.dashboard.visitsTrack.useMutation();

  useEffect(() => {
    track.mutate(undefined, {
      onSuccess: () => refetch(),
      onError: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = data?.total ?? 0;

  return (
    <div className="pointer-events-none select-none shrink-0 h-full">
      <div
        className="h-full flex flex-row items-center justify-center"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="flex flex-row items-center gap-2">
          <div
            className="h-7 w-7 flex items-center justify-center shrink-0"
            style={{ backgroundColor }}
          >
            <Eye className="h-4 w-4" style={{ color: textColor }} />
          </div>

          <div className="flex flex-col leading-4">
            <div className="text-[10.5px] font-medium" style={{ color: textColor }}>
              Pengunjung
            </div>
            <div className="text-[10.5px] font-medium" style={{ color: textColor }}>
              Hari Ini
            </div>
          </div>

          <div
            className="text-sm font-bold"
            style={{ color: textColor }}
            aria-label="Jumlah pengunjung hari ini"
          >
            {Number(total).toLocaleString("id-ID")}
          </div>
        </div>
      </div>
    </div>
  );
}
