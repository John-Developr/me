'use client'

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";

import { AdminIcons } from "@/components/icons/admin";
import { useDismiss } from "@/hooks/useDismiss";
import { useApp } from "@/lib/.context/AppContext";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminDatePicker.module.css";

/* ============================================================
   DATE RANGE PICKER
   ------------------------------------------------------------
   Trigger button + popover with quick picks and a calendar
   (react-day-picker, unstyled; every part is styled with the
   admin theme tokens in adminDatePicker.module.css).
   Dates go in and out as "YYYY-MM-DD" calendar days.
   ============================================================ */

/** "2026-11-05" → local Date at midnight (calendar day, no time zone shift). */
const toDate = (iso: string): Date => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
};

/** Local Date → "2026-11-05". */
const toIso = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;

const fmt = (date: Date, withYear: boolean) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}) });

/** "Oct 1 – Nov 5, 2026" (year shown once when both ends share it). */
export function formatRangeLabel(from: string, to: string): string {
    const a = toDate(from);
    const b = toDate(to);
    if (from === to) return fmt(a, true);
    return a.getFullYear() === b.getFullYear() ? `${fmt(a, false)} – ${fmt(b, true)}` : `${fmt(a, true)} – ${fmt(b, true)}`;
}

interface QuickPick {
    label: string;
    range: (max: Date) => { from: Date; to: Date };
}

const QUICK_PICKS: QuickPick[] = [
    { label: "Last 7 days",  range: (max) => ({ from: addDays(max, -6),  to: max }) },
    { label: "Last 30 days", range: (max) => ({ from: addDays(max, -29), to: max }) },
    { label: "Last 90 days", range: (max) => ({ from: addDays(max, -89), to: max }) },
    { label: "This month",   range: (max) => ({ from: new Date(max.getFullYear(), max.getMonth(), 1), to: max }) },
    { label: "Last month",   range: (max) => ({ from: new Date(max.getFullYear(), max.getMonth() - 1, 1), to: new Date(max.getFullYear(), max.getMonth(), 0) }) },
    { label: "This year",    range: (max) => ({ from: new Date(max.getFullYear(), 0, 1), to: max }) },
];

interface DateRangePickerProps {
    /** Current range ("YYYY-MM-DD"). */
    from:      string;
    to:        string;
    /** Latest selectable day ("YYYY-MM-DD"), usually today. */
    max:       string;
    /** Longest allowed range, in days. */
    maxDays?:  number;
    /** Highlight the trigger (e.g. when a custom range is active). */
    active?:   boolean;
    busy?:     boolean;
    /** Popover alignment under the trigger. */
    align?:    "start" | "end";
    onApply:   (from: string, to: string) => void;
}

export default function DateRangePicker({ from, to, max, maxDays = 365, active, busy, align = "end", onApply }: DateRangePickerProps) {
    const { isMobile } = useApp();
    const maxDate = useMemo(() => toDate(max), [max]);

    const [open,  setOpen]  = useState<boolean>(false);
    const [draft, setDraft] = useState<DateRange | undefined>(undefined);
    const [month, setMonth] = useState<Date>(() => toDate(from));

    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    const openPanel = () => {
        const start = toDate(from);
        const end   = toDate(to);
        setDraft({ from: start, to: end });
        // Two months shown: put the end month on the right when they differ.
        setMonth(isMobile || (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth())
            ? end
            : new Date(end.getFullYear(), end.getMonth() - 1, 1));
        setOpen(true);
    };

    const pick = (q: QuickPick) => {
        const r = q.range(maxDate);
        setDraft(r);
        setMonth(isMobile ? r.to : new Date(r.to.getFullYear(), r.to.getMonth() - 1, 1));
    };

    const complete = !!draft?.from && !!draft?.to;
    const tooLong  = complete && daysBetween(draft!.from!, draft!.to!) > maxDays;
    const length   = complete ? daysBetween(draft!.from!, draft!.to!) : 0;

    const apply = () => {
        if (!complete || tooLong) return;
        onApply(toIso(draft!.from!), toIso(draft!.to!));
        setOpen(false);
    };

    const activePick = complete
        ? QUICK_PICKS.find((q) => {
            const r = q.range(maxDate);
            return toIso(r.from) === toIso(draft!.from!) && toIso(r.to) === toIso(draft!.to!);
        })?.label
        : undefined;

    return (
        <div ref={rootRef} className={styles.root}>
            <button
                type="button"
                className={`${styles.trigger} ${active ? styles.active : ""}`}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={panelId}
                disabled={busy}
                onClick={() => (open ? close() : openPanel())}>
                <AdminIcons.Clock width={15} height={15} aria-hidden="true" />
                <span>{formatRangeLabel(from, to)}</span>
                <AdminIcons.ChevronDown width={14} height={14} className={styles.chevron} aria-hidden="true" />
            </button>

            {open && (
                <div id={panelId} role="dialog" aria-label="Choose a date range" className={`${styles.panel} ${styles[align]}`}>
                    <div className={styles.picks} role="list">
                        {QUICK_PICKS.map((q) => (
                            <button
                                key={q.label}
                                type="button"
                                role="listitem"
                                className={activePick === q.label ? styles.picked : ""}
                                onClick={() => pick(q)}>
                                {q.label}
                                {activePick === q.label && <AdminIcons.Check width={14} height={14} aria-hidden="true" />}
                            </button>
                        ))}
                    </div>

                    <div className={styles.calendar}>
                        <DayPicker
                            mode="range"
                            selected={draft}
                            onSelect={setDraft}
                            month={month}
                            onMonthChange={setMonth}
                            numberOfMonths={isMobile ? 1 : 2}
                            disabled={{ after: maxDate }}
                            endMonth={maxDate}
                            weekStartsOn={0}
                            showOutsideDays={false}
                            classNames={{
                                root:           styles.dp,
                                months:         styles.months,
                                month:          styles.month,
                                month_caption:  styles.caption,
                                caption_label:  styles["caption-label"],
                                nav:            styles.nav,
                                button_previous: styles["nav-btn"],
                                button_next:    styles["nav-btn"],
                                chevron:        styles["nav-icon"],
                                month_grid:     styles.grid,
                                weekdays:       styles.weekdays,
                                weekday:        styles.weekday,
                                week:           styles.week,
                                day:            styles.day,
                                day_button:     styles["day-btn"],
                                today:          styles.today,
                                disabled:       styles.disabled,
                                outside:        styles.outside,
                                selected:       styles.selected,
                                range_start:    styles["range-start"],
                                range_middle:   styles["range-middle"],
                                range_end:      styles["range-end"],
                                focused:        styles.focused,
                                hidden:         styles.hidden,
                            }} />

                        <footer className={styles.footer}>
                            <p className={tooLong ? styles.warn : ""} aria-live="polite">
                                {!draft?.from
                                    ? "Pick a start date"
                                    : !draft.to
                                        ? "Now pick an end date"
                                        : tooLong
                                            ? `Ranges can be up to ${maxDays} days (this is ${length})`
                                            : `${formatRangeLabel(toIso(draft.from), toIso(draft.to))} · ${length} day${length === 1 ? "" : "s"}`}
                            </p>
                            <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={close}>Cancel</button>
                            <button type="button" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={!complete || tooLong} onClick={apply}>
                                Apply
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
