import type { FormatItemModel } from "../models";
import { HEIGHT_NORMALIZATION_RANGES } from "./constants";

export function parseHeight(f: FormatItemModel): number | undefined {
  if (typeof f.height === "number" && f.height > 0) return f.height;
  const note = f.format_note || "";
  const match = note.match(/(\d{3,4})p/i);
  if (match) return parseInt(match[1], 10);
  return undefined;
}

export function normalizeHeight(h?: number): number | undefined {
  if (!h) return undefined;
  for (const range of HEIGHT_NORMALIZATION_RANGES) {
    if (h >= range.min && h <= range.max) return range.normalized;
  }
  return h;
}
