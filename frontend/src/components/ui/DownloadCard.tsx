import { DownloadButton } from "./DownloadButton";
import type { FormatItemModel } from "../../core/models";

interface Props {
  format: FormatItemModel;
  label: string;
  downloading: boolean;
  progress?: number;
  onDownload: () => void;
}

export function DownloadCard({
  format,
  label,
  downloading,
  progress,
  onDownload,
}: Props) {
  return (
    <div className="p-4 border rounded-2xl shadow-md flex flex-col justify-between bg-white dark:bg-neutral-950">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {format.height ? `${format.height}p` : label} |{" "}
          {format.ext.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Kbps: {format.tbr ?? "-"}
        </span>
      </div>

      <DownloadButton
        className="mt-2 min-w-30"
        onClick={onDownload}
        disabled={downloading}
        progress={progress}
        state={downloading ? "loading" : "default"}
        aria-label={`Download ${format.ext} at ${label}p`}
      >
        Download
      </DownloadButton>
    </div>
  );
}
