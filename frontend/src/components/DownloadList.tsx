import { useDownloadList } from "../core/hooks/useDownloadList";
import { DownloadListUI } from "../components/ui/DownloadListUI";
import type { FormatItemModel } from "../core/models";

interface Props {
  title?: string;
  formats: FormatItemModel[];
  lastUrl: string;
  thumbnailUrl?: string;
  fetchingInfo: boolean;
}

export function DownloadList({ title, formats, lastUrl, thumbnailUrl, fetchingInfo }: Props) {
  const { sortedGroups, startDownload, isDownloading, getProgress } =
    useDownloadList(formats, lastUrl, fetchingInfo);

  return (
    <DownloadListUI
      sortedGroups={sortedGroups}
      startDownload={startDownload}
      isDownloading={isDownloading}
      getProgress={getProgress}
      title={title}
      thumbnailUrl={thumbnailUrl}
      fetchingInfo={fetchingInfo}
    />
  );
}
