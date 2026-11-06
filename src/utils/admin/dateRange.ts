import type { TrafficRange, TrafficRangePreset } from "@/utils/types";

/* ============================================================
   DATE RANGES (traffic chart)
   ------------------------------------------------------------
   All dates are calendar days in UTC, formatted YYYY-MM-DD,
   and both ends are inclusive.
   ============================================================ */

export const TRAFFIC_PRESETS: Record<TrafficRangePreset, number> = {
  "7d":  7,
  "30d": 30,
  "90d": 90,
};

/** Longest custom range accepted, in days. */
export const MAX_RANGE_DAYS = 365;

const DAY_MS   = 24 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Date → "YYYY-MM-DD" (UTC). */
export const toIsoDay = (date: Date): string => date.toISOString().slice(0, 10);

/** "YYYY-MM-DD" → Date at 00:00 UTC, or null when invalid (e.g. 2026-02-30). */
export function parseIsoDay(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && toIsoDay(date) === value ? date : null;
}

/** Number of days in a range, counting both ends. */
export const rangeLength = (range: TrafficRange): number =>
  Math.round((Date.parse(range.to) - Date.parse(range.from)) / DAY_MS) + 1;

export const isTrafficPreset = (value: unknown): value is TrafficRangePreset =>
  typeof value === "string" && value in TRAFFIC_PRESETS;

/** The last N days, ending today (UTC). */
export function presetToRange(preset: TrafficRangePreset, now: Date = new Date()): TrafficRange {
  const to   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const from = new Date(to.getTime() - (TRAFFIC_PRESETS[preset] - 1) * DAY_MS);

  return { from: toIsoDay(from), to: toIsoDay(to) };
}

/** The same-length period immediately before `range` (for comparisons). */
export function previousRange(range: TrafficRange): TrafficRange {
  const days = rangeLength(range);
  const to   = new Date(Date.parse(range.from) - DAY_MS);
  const from = new Date(to.getTime() - (days - 1) * DAY_MS);

  return { from: toIsoDay(from), to: toIsoDay(to) };
}

/** Every day in the range, oldest first. */
export function enumerateDays(range: TrafficRange): string[] {
  const days: string[] = [];
  const end = Date.parse(range.to);

  for (let t = Date.parse(range.from); t <= end; t += DAY_MS) {
    days.push(toIsoDay(new Date(t)));
  }

  return days;
}

export type RangeParseResult =
  | { ok: true;  range: TrafficRange }
  | { ok: false; error: string };

/**
 * Validates `?range=7d|30d|90d` or `?from=YYYY-MM-DD&to=YYYY-MM-DD`.
 * Defaults to the last 30 days when nothing is given.
 */
export function parseRangeParams(
  params: { range?: string | null; from?: string | null; to?: string | null },
  now: Date = new Date(),
): RangeParseResult {
  const { range, from, to } = params;

  if (from || to) {
    if (!from || !to) return { ok: false, error: "Both a start and an end date are required." };

    const start = parseIsoDay(from);
    const end   = parseIsoDay(to);
    if (!start || !end) return { ok: false, error: "Dates must be valid and use the YYYY-MM-DD format." };
    if (start > end)    return { ok: false, error: "The start date must be on or before the end date." };
    if (toIsoDay(end) > presetToRange("7d", now).to) {
      return { ok: false, error: "The end date can't be in the future." };
    }

    const custom = { from, to };
    if (rangeLength(custom) > MAX_RANGE_DAYS) {
      return { ok: false, error: `Ranges are limited to ${MAX_RANGE_DAYS} days.` };
    }

    return { ok: true, range: custom };
  }

  if (range && !isTrafficPreset(range)) {
    return { ok: false, error: "Unknown range. Use 7d, 30d or 90d." };
  }

  return { ok: true, range: presetToRange(isTrafficPreset(range) ? range : "30d", now) };
}
