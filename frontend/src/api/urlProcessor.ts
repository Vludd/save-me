export async function processUrl(url: string) {
  const body = { url };

  const response = await fetch(
    `/api/info`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) throw new Error("Failed to process url");

  return response.json() as Promise<{ title: string; formats?: unknown[] }>;
}

export async function downloadFile(
  url: string,
  format_id: string,
  onProgress?: (loaded: number, total?: number) => void
): Promise<{ filename?: string }> {
  const startUrl = `/api/download/start?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(format_id)}`;
  const startResp = await fetch(startUrl, { method: "POST" });
  if (!startResp.ok) {
    const text = await startResp.text().catch(() => "");
    throw new Error(`Failed to start download: ${startResp.status} ${text}`);
  }

  const startJson = await startResp.json().catch(() => ({} as unknown));
  const downloadId = startJson?.download_id;
  if (!downloadId) throw new Error("No download_id returned from server");

  const pollInterval = 800;
  while (true) {
    const statusResp = await fetch(`/api/download/status/${downloadId}`);
    if (!statusResp.ok) {
      const text = await statusResp.text().catch(() => "");
      throw new Error(`Status request failed: ${statusResp.status} ${text}`);
    }
    const info = await statusResp.json().catch(() => ({} as unknown));

    const status = info.status as string | undefined;
    const percent = typeof info.percent === "number" ? info.percent : undefined;

    if (status === "queued" || status === "downloading") {
      if (typeof percent === "number") onProgress?.(percent, 100);
      else onProgress?.(0, undefined);
    } else if (status === "finished") {
      onProgress?.(100, 100);
      break;
    } else if (status === "error") {
      throw new Error(info.error || "Download failed on server");
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  const fileResp = await fetch(`/api/download/file/${downloadId}`);
  if (!fileResp.ok) {
    const text = await fileResp.text().catch(() => "");
    throw new Error(`Failed to fetch file: ${fileResp.status} ${text}`);
  }

  const contentDisposition = fileResp.headers.get("content-disposition") || "";
  let filename = "file";
  const m = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  if (m) filename = decodeURIComponent(m[1] || m[2]);

  const blob = await fileResp.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

  return { filename };
}
