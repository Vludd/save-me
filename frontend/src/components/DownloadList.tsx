import { useDownloadList } from "../core/hooks/useDownloadList";
import { DownloadListUI } from "../components/ui/DownloadListUI";
import type { FormatItemModel } from "../core/models";

interface Props {
  formats: FormatItemModel[];
  lastUrl: string;
  fetchingInfo: boolean;
}

export function DownloadList({ formats, lastUrl, fetchingInfo }: Props) {
  const { sortedGroups, startDownload, isDownloading, getProgress } =
    useDownloadList(formats, lastUrl, fetchingInfo);

  return (
    <DownloadListUI
      sortedGroups={sortedGroups}
      startDownload={startDownload}
      isDownloading={isDownloading}
      getProgress={getProgress}
      fetchingInfo={fetchingInfo}
    />
  );
}
