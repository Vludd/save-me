import type { FormatItemModel } from "../models";
import { parseHeight, normalizeHeight } from "./heightUtils";
import { DEFAULT_ALLOWED_HEIGHTS } from "./constants";

export type FormatGroups = Record<string, FormatItemModel[]>;

export function groupAndFilterFormats(
  formats: FormatItemModel[],
  allowedHeights: number[] = DEFAULT_ALLOWED_HEIGHTS
): FormatGroups {
  const withHeights = formats.map((f) => ({
    f,
    h: normalizeHeight(parseHeight(f)),
  }));

  const accepted = withHeights.filter(
    ({ h }) => h && allowedHeights.includes(h)
  );

  const bestMap = new Map<string, FormatItemModel>();
  for (const { f, h } of accepted) {
    const key = `${h ?? "na"}|${f.ext ?? "na"}`;
    const prev = bestMap.get(key);
    if (!prev || (f.tbr ?? 0) > (prev.tbr ?? 0)) {
      bestMap.set(key, f);
    }
  }

  const groups: FormatGroups = {};
  for (const f of bestMap.values()) {
    const h = parseHeight(f) ?? 0;
    const label = h > 0 ? `${h}p` : "other";
    groups[label] = groups[label] ?? [];
    groups[label].push(f);
  }

  for (const label of Object.keys(groups)) {
    groups[label].sort((a, b) => (b.tbr ?? 0) - (a.tbr ?? 0));
  }

  const ordered: FormatGroups = {};
  for (const h of allowedHeights.map((h) => `${h}p`))
    if (groups[h]) ordered[h] = groups[h];
  for (const k of Object.keys(groups)) if (!ordered[k]) ordered[k] = groups[k];

  return ordered;
}
