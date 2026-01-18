import { DownloadCard } from "./DownloadCard";
import { DownloadIcon } from "lucide-react";
import type { FormatItemModel } from "../../core/models";

interface Props {
  sortedGroups: [string, FormatItemModel[]][];
  startDownload: (id: string) => void;
  isDownloading: (id: string) => boolean;
  getProgress: (id: string) => number | undefined;
  title?: string;
  thumbnailUrl?: string;
  fetchingInfo: boolean;
}

export function DownloadListUI({
  sortedGroups,
  startDownload,
  isDownloading,
  getProgress,
  title,
  thumbnailUrl,
  fetchingInfo,
}: Props) {
  if (fetchingInfo) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-2xl animate-pulse shadow-md flex flex-col gap-2"
          >
            <div className="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full mt-2" />
            <div className="h-10 w-28 bg-gray-300 dark:bg-gray-600 rounded mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!sortedGroups.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400 text-center">
        <DownloadIcon className="w-8 h-8 mb-2" />
        <span className="text-sm mb-1">No formats available</span>
        <span className="text-xs">Try another video or check back later</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {title && thumbnailUrl && (
        <div className="p-4 my-2 border rounded-2xl shadow-md grid sm:grid-cols-1 gap-4 md:grid-cols-2 justify-between bg-white dark:bg-neutral-950">
          {thumbnailUrl && <img src={thumbnailUrl} className="w-full rounded-xl"></img>}
          <div className="flex flex-col text-left">
            <p>{title || "Unknown title"}</p>
          </div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedGroups.map(([label, items]) =>
          items.map((f) => (
            <DownloadCard
              key={f.format_id}
              format={f}
              label={label}
              downloading={isDownloading(f.format_id)}
              progress={getProgress(f.format_id)}
              onDownload={() => startDownload(f.format_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
