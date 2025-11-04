import type { FormatItemModel } from "../models";

export function parseHeight(f: FormatItemModel): number | undefined {
  if (typeof f.height === "number" && f.height > 0) return f.height;
  const note = (f.format_note || "") as string;
  const m = note.match(/(\d{3,4})p/i);
  if (m) return parseInt(m[1], 10);
  return undefined;
}

function normalizeHeight(h?: number): number | undefined {
  if (!h) return undefined;
  if (h >= 1000 && h <= 1100) return 540;
  if (h >= 1200 && h <= 1300) return 720;
  return h;
}

export function groupAndFilterFormats(
  formats: FormatItemModel[],
  allowedHeights: number[] = [720, 540, 480, 360, 240]
): Record<string, FormatItemModel[]> {
  const withH = formats.map(f => {
    const rawH = parseHeight(f);
    const h = normalizeHeight(rawH);
    return { f, h };
  });

  const accepted = withH.filter(({ h }) => h && allowedHeights.includes(h));

  const map = new Map<string, FormatItemModel>();
  for (const { f, h } of accepted) {
    const key = `${h ?? "na"}|${f.ext ?? "na"}`;
    const prev = map.get(key);
    if (!prev) { map.set(key, f); continue; }
    const prevT = prev.tbr ?? 0;
    const curT = f.tbr ?? 0;
    if (curT > prevT) map.set(key, f);
  }

  const groups: Record<string, FormatItemModel[]> = {};
  for (const f of Array.from(map.values())) {
    const h = parseHeight(f) ?? 0;
    const label = h > 0 ? `${h}p` : "other";
    groups[label] = groups[label] ?? [];
    groups[label].push(f);
  }

  Object.keys(groups).forEach(label => {
    groups[label].sort((a, b) => (b.tbr ?? 0) - (a.tbr ?? 0));
  });

  const order = allowedHeights.map(h => `${h}p`);
  const ordered: Record<string, FormatItemModel[]> = {};
  for (const o of order) if (groups[o]) ordered[o] = groups[o];
  for (const k of Object.keys(groups)) if (!ordered[k]) ordered[k] = groups[k];

  return ordered;
}