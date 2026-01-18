import { useState } from "react";
import { processUrl } from "@/api/urlProcessor";
import type { FormatItemModel } from "@/core/models";

export function useUrlProcessor() {
  const [title, setTitle] = useState<string | undefined>();
  const [formats, setFormats] = useState<FormatItemModel[]>([]);
  const [lastUrl, setLastUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();

  const fetchInfo = async (url: string) => {
    if (!url) {
      setFormats([]);
      setLastUrl("");
      return;
    }

    if (loading) return;

    setLastUrl(url);
    setLoading(true);

    try {
      const res = await processUrl(url);
      const formatsArray = Array.isArray(res.formats)
        ? res.formats.reverse()
        : [];
      setTitle(res.title)
      setFormats(formatsArray as FormatItemModel[]);
      setThumbnailUrl(res.thumbnail)
    } catch (err) {
      console.error("Fetching info error:", err);
      setFormats([]);
    } finally {
      setLoading(false);
    }
  };

  return { title, formats, lastUrl, loading, thumbnailUrl, fetchInfo };
}
