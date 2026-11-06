/* ============================================================
   ADMIN FORMATTERS
   ------------------------------------------------------------
   Display helpers for dashboard numbers and timestamps.
   ============================================================ */

const numberFormat = new Intl.NumberFormat("en-US");

/** 1234 → "1,234". */
export const formatNumber = (value: number): string => numberFormat.format(value);

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year",   365 * 24 * 60 * 60],
  ["month",  30 * 24 * 60 * 60],
  ["week",   7 * 24 * 60 * 60],
  ["day",    24 * 60 * 60],
  ["hour",   60 * 60],
  ["minute", 60],
];

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** ISO timestamp → "3 hours ago", "yesterday", "just now". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((Date.parse(iso) - now.getTime()) / 1000);

  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }

  return "just now";
}

/** ISO timestamp → "Nov 6, 2026, 3:04 PM" (viewer's locale time zone on the client). */
export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

/** "2026-11-06" → "Nov 6" (UTC day, as stored). */
export const formatShortDay = (day: string): string =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** "2026-11-06" → "Fri, Nov 6, 2026". */
export const formatLongDay = (day: string): string =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

/** Percent change, or null when there's no baseline to compare against. */
export function percentChange(current: number, previous: number | undefined): number | null {
  if (previous === undefined || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
