import { useMemo } from "react";
import { useDownloads } from "@/core/hooks/useDownloads";
import { groupAndFilterFormats } from "@/core/utils/formatParser";
import type { FormatItemModel } from "../../core/models";

const RESOLUTION_ORDER = [1280, 1024, 720, 540, 480, 360, 240, 144];

export function useDownloadList(
  formats: FormatItemModel[],
  lastUrl: string,
  fetchingInfo: boolean
) {
  const { startDownload, isDownloading, getProgress } = useDownloads(
    fetchingInfo,
    lastUrl
  );

  const grouped = useMemo(
    () => groupAndFilterFormats(formats, RESOLUTION_ORDER),
    [formats]
  );

  const sortedGroups = useMemo(
    () =>
      Object.entries(grouped).sort(
        ([a], [b]) => parseInt(b, 10) - parseInt(a, 10)
      ),
    [grouped]
  );

  return { sortedGroups, startDownload, isDownloading, getProgress };
}
