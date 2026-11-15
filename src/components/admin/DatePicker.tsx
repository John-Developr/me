'use client'

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { CaptionLabelProps, DayPicker } from "react-day-picker";

import { toDate, toIso } from "@/components/admin/DateRangePicker";
import { MONTHS } from "@/components/admin/MonthPicker";
import { AdminIcons } from "@/components/icons/admin";
import { useDismiss } from "@/hooks/useDismiss";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminDatePicker.module.css";

/* ============================================================
   DATE PICKER
   ------------------------------------------------------------
   Form-field single-date picker in the DateRangePicker /
   MonthPicker look (adminDatePicker.module.css). The day view
   is react-day-picker; clicking the caption ("Jul 1999") opens a
   year grid, then a month grid, so far-away dates (birthdates)
   are three clicks away instead of hundreds of arrows.
   Values go in and out as "YYYY-MM-DD" ("" = empty).
   ============================================================ */

type View = "days" | "months" | "years";

/** Years shown per page in the year grid (4 rows of 3). */
const YEARS_PER_PAGE = 12;

const isDay = (v?: string): v is string => !!v && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v);

/** "1999-07-14" → "Jul 14, 1999" (fixed names, so server and client render the same). */
export function formatDayLabel(value: string): string {
    const [y, m, d] = value.split("-").map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
}

interface DatePickerProps {
    /** Control id (FormField's label points here). */
    id:                  string;
    /** "YYYY-MM-DD" or "". */
    value:               string;
    /** Earliest / latest selectable day ("YYYY-MM-DD"). */
    min?:                string;
    max?:                string;
    disabled?:           boolean;
    placeholder?:        string;
    /** Shows a "Clear" button in the popover. */
    clearable?:          boolean;
    /** Red border; the error text itself is linked via aria-describedby. */
    "aria-invalid"?:     boolean;
    "aria-describedby"?: string;
    onChange:            (value: string) => void;
}

export default function DatePicker({
    id, value, min, max, disabled, placeholder = "Pick a date", clearable, onChange, ...aria
}: DatePickerProps) {
    const [open,  setOpen]  = useState<boolean>(false);
    const [view,  setView]  = useState<View>("days");
    const [month, setMonth] = useState<Date>(() => new Date());

    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    const minDate = isDay(min) ? toDate(min) : undefined;
    const maxDate = isDay(max) ? toDate(max) : undefined;
    const minYear = minDate?.getFullYear() ?? -Infinity;
    const maxYear = maxDate?.getFullYear() ?? Infinity;

    const year      = month.getFullYear();
    const pageStart = Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
    const today     = new Date();

    const openPanel = () => {
        // Start on the selected day, else the latest allowed day, else today.
        const base = isDay(value) ? toDate(value) : maxDate ?? new Date();
        setMonth(new Date(base.getFullYear(), base.getMonth(), 1));
        setView("days");
        setOpen(true);
    };

    const choose = (next: string) => {
        onChange(next);
        setOpen(false);
    };

    const showYear  = (y: number) => setMonth((m) => new Date(y, m.getMonth(), 1));
    const monthKey  = (y: number, i: number) => `${y}-${String(i + 1).padStart(2, "0")}`;
    const monthOut  = (y: number, i: number) =>
        (isDay(min) && monthKey(y, i) < min.slice(0, 7)) || (isDay(max) && monthKey(y, i) > max.slice(0, 7));

    // Caption label as a button that opens the year grid (stable identity, so DayPicker doesn't remount it).
    const components = useMemo(() => ({
        CaptionLabel: ({ children }: CaptionLabelProps) => (
            <button type="button" className={styles["caption-btn"]} aria-label="Choose month and year" onClick={() => setView("years")}>
                {children}
                <AdminIcons.ChevronDown width={14} height={14} aria-hidden="true" />
            </button>
        ),
    }), []);

    return (
        <div ref={rootRef} className={styles.root}>
            <button
                id={id}
                type="button"
                className={`${styles.trigger} ${styles["field-trigger"]} ${aria["aria-invalid"] ? styles.invalid : ""}`}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                aria-describedby={aria["aria-describedby"]}
                disabled={disabled}
                onClick={() => (open ? close() : openPanel())}>
                <AdminIcons.Clock width={15} height={15} aria-hidden="true" />
                <span className={isDay(value) ? "" : styles.placeholder}>
                    {isDay(value) ? formatDayLabel(value) : placeholder}
                </span>
                <AdminIcons.ChevronDown width={14} height={14} className={styles.chevron} aria-hidden="true" />
            </button>

            {open && (
                <div id={panelId} role="dialog" aria-label="Choose a date" className={`${styles.panel} ${styles.start}`}>
                    <div className={styles.calendar}>
                        {view === "days" && (
                            <DayPicker
                                mode="single"
                                required
                                selected={isDay(value) ? toDate(value) : undefined}
                                onSelect={(day) => choose(toIso(day))}
                                month={month}
                                onMonthChange={setMonth}
                                startMonth={minDate}
                                endMonth={maxDate}
                                disabled={[
                                    ...(minDate ? [{ before: minDate }] : []),
                                    ...(maxDate ? [{ after: maxDate }] : []),
                                ]}
                                weekStartsOn={0}
                                showOutsideDays={false}
                                components={components}
                                classNames={{
                                    root:            styles.dp,
                                    months:          styles.months,
                                    month:           styles.month,
                                    month_caption:   styles.caption,
                                    nav:             styles.nav,
                                    button_previous: styles["nav-btn"],
                                    button_next:     styles["nav-btn"],
                                    chevron:         styles["nav-icon"],
                                    month_grid:      styles.grid,
                                    weekdays:        styles.weekdays,
                                    weekday:         styles.weekday,
                                    week:            styles.week,
                                    day:             styles.day,
                                    day_button:      styles["day-btn"],
                                    today:           styles.today,
                                    disabled:        styles.disabled,
                                    outside:         styles.outside,
                                    selected:        styles.selected,
                                    focused:         styles.focused,
                                    hidden:          styles.hidden,
                                }} />
                        )}

                        {view === "years" && (
                            <div className={`${styles["month-panel"]} ${styles["date-grid"]}`}>
                                <div className={styles.caption}>
                                    <button
                                        type="button"
                                        className={`${styles["nav-btn"]} ${styles["nav-prev"]}`}
                                        aria-label="Earlier years"
                                        disabled={pageStart <= minYear}
                                        onClick={() => showYear(year - YEARS_PER_PAGE)}>
                                        <AdminIcons.ChevronDown width={16} height={16} />
                                    </button>
                                    <span className={styles["caption-label"]} aria-live="polite">
                                        {pageStart} – {pageStart + YEARS_PER_PAGE - 1}
                                    </span>
                                    <button
                                        type="button"
                                        className={`${styles["nav-btn"]} ${styles["nav-next"]}`}
                                        aria-label="Later years"
                                        disabled={pageStart + YEARS_PER_PAGE > maxYear}
                                        onClick={() => showYear(year + YEARS_PER_PAGE)}>
                                        <AdminIcons.ChevronDown width={16} height={16} />
                                    </button>
                                </div>

                                <div className={styles["month-grid"]}>
                                    {Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i).map((y) => (
                                        <button
                                            key={y}
                                            type="button"
                                            className={`${styles["month-btn"]} ${y === year ? styles.selected : ""} ${y === today.getFullYear() ? styles.today : ""}`}
                                            aria-pressed={y === year}
                                            disabled={y < minYear || y > maxYear}
                                            autoFocus={y === year}
                                            onClick={() => { showYear(y); setView("months"); }}>
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {view === "months" && (
                            <div className={`${styles["month-panel"]} ${styles["date-grid"]}`}>
                                <div className={styles.caption}>
                                    <button
                                        type="button"
                                        className={`${styles["nav-btn"]} ${styles["nav-prev"]}`}
                                        aria-label="Previous year"
                                        disabled={year <= minYear}
                                        onClick={() => showYear(year - 1)}>
                                        <AdminIcons.ChevronDown width={16} height={16} />
                                    </button>
                                    <button type="button" className={styles["caption-btn"]} aria-label="Choose year" onClick={() => setView("years")}>
                                        {year}
                                        <AdminIcons.ChevronDown width={14} height={14} aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles["nav-btn"]} ${styles["nav-next"]}`}
                                        aria-label="Next year"
                                        disabled={year >= maxYear}
                                        onClick={() => showYear(year + 1)}>
                                        <AdminIcons.ChevronDown width={16} height={16} />
                                    </button>
                                </div>

                                <div className={styles["month-grid"]}>
                                    {MONTHS.map((label, i) => {
                                        const selected = i === month.getMonth();
                                        return (
                                            <button
                                                key={label}
                                                type="button"
                                                className={`${styles["month-btn"]} ${selected ? styles.selected : ""}`}
                                                aria-pressed={selected}
                                                aria-label={`${label} ${year}`}
                                                disabled={monthOut(year, i)}
                                                autoFocus={selected}
                                                onClick={() => { setMonth(new Date(year, i, 1)); setView("days"); }}>
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {clearable && (
                            <footer className={styles.footer}>
                                <p>{isDay(value) ? formatDayLabel(value) : "No date picked"}</p>
                                <button
                                    type="button"
                                    className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                                    disabled={!isDay(value)}
                                    onClick={() => choose("")}>
                                    Clear
                                </button>
                            </footer>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
