import type { TimelineGroup, TimelineSource } from "@/utils/types";

/* ============================================================
   EXPERIENCE TIMELINE
   ------------------------------------------------------------
   Turns experience rows into the home page "Experience." card:
   - roles at the same company are grouped (newest role first)
   - groups with a current role come first, then newest first
   - dates show as "MM / YYYY"; open-ended entries end in "Present"
   - grouped roles get a duration ("For 2 Years and 10 Months"),
     counted in whole months; milestones show a single date
   Pure functions — `today` is passed in for stable output/tests.
   ============================================================ */

/** "2023-07-01" → { year: 2023, month: 7 } */
const parts = (iso: string) => ({ year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) });

/** Whole months from start to end (or today when open-ended). */
export function monthsBetween(start: string, end: string | null, today: Date): number {
  const s = parts(start);
  const e = end ? parts(end) : { year: today.getUTCFullYear(), month: today.getUTCMonth() + 1 };
  return Math.max(0, (e.year - s.year) * 12 + (e.month - s.month));
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** 11 → "For 11 Months", 34 → "For 2 Years and 10 Months", 0 → "Less than a month". */
export function formatDuration(months: number): string {
  if (months < 1) return "Less than a month";

  const years = Math.floor(months / 12);
  const rest  = months % 12;

  if (years === 0) return `For ${plural(rest, "Month")}`;
  if (rest === 0)  return `For ${plural(years, "Year")}`;
  return `For ${plural(years, "Year")} and ${plural(rest, "Month")}`;
}

/** "2023-07-01" → "07 / 2023" */
export const formatMonth = (iso: string): string => `${iso.slice(5, 7)} / ${iso.slice(0, 4)}`;

/** Date line for one entry. */
export function formatRange(entry: Pick<TimelineSource, "entry_type" | "start_date" | "end_date">): string {
  if (entry.entry_type === "milestone") return formatMonth(entry.start_date);
  return `${formatMonth(entry.start_date)} - ${entry.end_date ? formatMonth(entry.end_date) : "Present"}`;
}

const groupKey = (entry: TimelineSource) =>
  entry.entry_type === "work" ? `work:${entry.company.trim().toLowerCase()}` : `${entry.entry_type}:${entry.id ?? entry.company}:${entry.start_date}`;

/** Newest first; open-ended entries (current) before finished ones that started later. */
const byRecency = (a: TimelineSource, b: TimelineSource) => {
  const aOpen = a.entry_type !== "milestone" && a.end_date === null;
  const bOpen = b.entry_type !== "milestone" && b.end_date === null;
  if (aOpen !== bOpen) return aOpen ? -1 : 1;
  return b.start_date.localeCompare(a.start_date);
};

/** Builds the grouped, ordered timeline with display labels. */
export function buildTimeline(entries: TimelineSource[], today: Date): TimelineGroup[] {
  const groups = new Map<string, TimelineSource[]>();

  for (const entry of [...entries].sort(byRecency)) {
    const key = groupKey(entry);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }

  return [...groups.entries()].map(([key, roles]) => {
    const isGroup  = roles.length > 1;
    const first    = roles[0];
    const start    = roles.reduce((min, r) => (r.start_date < min ? r.start_date : min), first.start_date);
    const isOpen   = roles.some((r) => r.end_date === null);
    const end      = isOpen ? null : roles.reduce((max, r) => (r.end_date! > max ? r.end_date! : max), first.end_date!);

    return {
      key,
      company:   first.company,
      logoUrl:   roles.find((r) => r.logo_url)?.logo_url ?? null,
      dateLabel: formatRange({ entry_type: first.entry_type, start_date: start, end_date: end }),
      roles: roles.map((r, i) => ({
        key:           r.id ?? `${key}:${i}`,
        position:      r.position,
        dateLabel:     formatRange(r),
        durationLabel: isGroup ? formatDuration(monthsBetween(r.start_date, r.end_date, today)) : null,
      })),
    };
  });
}
