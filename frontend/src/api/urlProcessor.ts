const BASE_API = "/api/v1"

export async function processUrl(url: string) {
  const response = await fetch(`${BASE_API}/media/info?url=${encodeURIComponent(url)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to process url");

  return response.json() as Promise<{ title?: string; formats?: unknown[]; thumbnail?: string }>;
}

export async function downloadFile(
  url: string,
  format_id: string,
  onProgress?: (loaded: number, total?: number) => void
): Promise<{ filename?: string }> {
  const downloadUrl = `${BASE_API}/download`;
  const body = { url, format_id };

  const startResp = await fetch(downloadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = startResp.headers.get("content-type") || "";

  if (contentType.includes("application/octet-stream")) {
    const blob = await startResp.blob();

    const contentDisposition = startResp.headers.get("content-disposition") || "";
    let filename = "file";
    const m = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    if (m) filename = decodeURIComponent(m[1] || m[2]);

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    onProgress?.(100, 100);
    return { filename };
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Unexpected response content-type: ${contentType}`);
  }

  const startJson = await startResp.json();
  const downloadId = startJson?.download_id;
  if (!downloadId) throw new Error("No download_id returned from server");

  const pollInterval = 800;
  while (true) {
    const statusResp = await fetch(`${BASE_API}/download/${downloadId}`);
    if (!statusResp.ok) {
      const text = await statusResp.text().catch(() => "");
      throw new Error(`Status request failed: ${statusResp.status} ${text}`);
    }

    const info = await statusResp.json();
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

  const saveFileResp = await fetch(downloadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!saveFileResp.ok) {
    const text = await saveFileResp.text().catch(() => "");
    throw new Error(`Failed to fetch file: ${saveFileResp.status} ${text}`);
  }

  const blob = await saveFileResp.blob();
  const contentDisposition = saveFileResp.headers.get("content-disposition") || "";
  let filename = "file";
  const m = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  if (m) filename = decodeURIComponent(m[1] || m[2]);

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
