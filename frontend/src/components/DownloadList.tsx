import { useMemo } from "react";
import { DownloadIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"
import type { FormatItemModel } from "../core/models"
import { groupAndFilterFormats } from "@/core/utils/formatParser";
import { useDownloads } from "@/core/hooks/useDownloads";

interface Props {
  formats: FormatItemModel[];
  lastUrl: string;
  fetchingInfo: boolean;
}

export function DownloadList({ formats, lastUrl, fetchingInfo }: Props) {
  const { startDownload, isDownloading, getProgress } = useDownloads(fetchingInfo, lastUrl);

  const grouped = useMemo(() => groupAndFilterFormats(formats, [1280, 1024, 720, 540, 480, 360, 240, 144]), [formats]);

  const sortedGroups = useMemo(() => {
    return Object.entries(grouped).sort(([a], [b]) => {
      const ah = parseInt(a, 10);
      const bh = parseInt(b, 10);
      if (isNaN(ah)) return 1;
      if (isNaN(bh)) return -1;
      return bh - ah;
    });
  }, [grouped]);

  return (
    <div className="rounded-2xl border p-2 shadow-sm">
      {sortedGroups.length > 0 ? (
        sortedGroups.map(([label, items]) => (
          <div key={label} className="mb-3">
            <ul className="flex flex-col gap-2">
              {items.map(f => {
                const downloading = isDownloading(f.format_id);
                const progress = getProgress(f.format_id);

                return (
                  <li
                    key={f.format_id}
                    className="p-2 border rounded-xl flex gap-2 justify-between items-center"
                  >
                    <div>
                      <div className="text-l text-left">{label}</div>
                      <div className="text-xs text-left text-gray-500">
                        Kbps: {f.tbr} | .{f.ext}
                      </div>
                    </div>

                    <Button
                      className="cursor-pointer"
                      onClick={() => startDownload(f.format_id)}
                      disabled={downloading}
                    >
                      {progress != null ? (
                        <>
                          <Spinner />
                          <span>{progress}%</span>
                        </>
                      ) : downloading ? (
                        <>
                          <Spinner />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <DownloadIcon />
                          <span>Download</span>
                        </>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500">No formats</div>
      )}
    </div>
  );
}