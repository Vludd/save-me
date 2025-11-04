import { useState, useRef, useCallback } from "react";
import { downloadFile } from "@/api/urlProcessor";

export function useDownloads(fetchingInfo: boolean, lastUrl: string) {
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const downloadingRef = useRef<Record<string, boolean>>({});

  const startDownload = useCallback(async (format_id: string) => {
    if (fetchingInfo || !lastUrl || downloadingRef.current[format_id]) return;

    downloadingRef.current[format_id] = true;
    setDownloadingIds(prev => ({ ...prev, [format_id]: 0 }));

    try {
      await downloadFile(lastUrl, format_id, (loaded, total) => {
        if (!total) return;
        const pct = Math.min(100, Math.round((loaded / total) * 100));
        setDownloadingIds(prev => ({ ...prev, [format_id]: pct }));
      });
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setTimeout(() => {
        setDownloadingIds(prev => {
          const copy = { ...prev };
          delete copy[format_id];
          return copy;
        });
        delete downloadingRef.current[format_id];
      }, 500);
    }
  }, [fetchingInfo, lastUrl]);

  const isDownloading = useCallback((id: string) => {
    return !!downloadingRef.current[id] || !!downloadingIds[id];
  }, [downloadingIds]);

  const getProgress = useCallback((id: string) => {
    return downloadingIds[id];
  }, [downloadingIds]);

  return { startDownload, isDownloading, getProgress };
}
