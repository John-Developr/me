'use client'

import { useCallback, useId, useRef, useState } from "react";

import { AdminIcons } from "@/components/icons/admin";
import { useDismiss } from "@/hooks/useDismiss";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminDatePicker.module.css";

/* ============================================================
   MONTH PICKER
   ------------------------------------------------------------
   Form-field version of the DateRangePicker look: same trigger,
   popover and theme tokens (adminDatePicker.module.css), with a
   year header and a 12-month grid instead of a day calendar.
   Values go in and out as "YYYY-MM" ("" = empty).
   ============================================================ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isMonth = (v?: string): v is string => !!v && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
const toMonth = (year: number, index: number) => `${year}-${String(index + 1).padStart(2, "0")}`;

/** "2024-01" → "Jan 2024" (fixed names, so server and client render the same). */
export function formatMonthLabel(value: string): string {
    if (!isMonth(value)) return "";
    return `${MONTHS[Number(value.slice(5, 7)) - 1]} ${value.slice(0, 4)}`;
}

interface MonthPickerProps {
    /** Control id (FormField's label points here). */
    id:                  string;
    /** "YYYY-MM" or "". */
    value:               string;
    /** Earliest / latest selectable month ("YYYY-MM"). */
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

export default function MonthPicker({
    id, value, min, max, disabled, placeholder = "Pick a month", clearable, onChange, ...aria
}: MonthPickerProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [year, setYear] = useState<number>(0);

    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    const minYear = isMonth(min) ? Number(min.slice(0, 4)) : -Infinity;
    const maxYear = isMonth(max) ? Number(max.slice(0, 4)) : Infinity;

    const openPanel = () => {
        // Start on the selected year, else the latest allowed year, else this year.
        setYear(isMonth(value) ? Number(value.slice(0, 4)) : isMonth(max) ? maxYear : new Date().getFullYear());
        setOpen(true);
    };

    const choose = (next: string) => {
        onChange(next);
        setOpen(false);
    };

    const outOfRange = (m: string) => (isMonth(min) && m < min) || (isMonth(max) && m > max);
    const current    = new Date();
    const thisMonth  = toMonth(current.getFullYear(), current.getMonth());

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
                <span className={isMonth(value) ? "" : styles.placeholder}>
                    {isMonth(value) ? formatMonthLabel(value) : placeholder}
                </span>
                <AdminIcons.ChevronDown width={14} height={14} className={styles.chevron} aria-hidden="true" />
            </button>

            {open && (
                <div id={panelId} role="dialog" aria-label="Choose a month" className={`${styles.panel} ${styles.start}`}>
                    <div className={styles.calendar}>
                        <div className={styles["month-panel"]}>
                            <div className={styles.caption}>
                                <button
                                    type="button"
                                    className={`${styles["nav-btn"]} ${styles["nav-prev"]}`}
                                    aria-label="Previous year"
                                    disabled={year <= minYear}
                                    onClick={() => setYear((y) => y - 1)}>
                                    <AdminIcons.ChevronDown width={16} height={16} />
                                </button>
                                <span className={styles["caption-label"]} aria-live="polite">{year}</span>
                                <button
                                    type="button"
                                    className={`${styles["nav-btn"]} ${styles["nav-next"]}`}
                                    aria-label="Next year"
                                    disabled={year >= maxYear}
                                    onClick={() => setYear((y) => y + 1)}>
                                    <AdminIcons.ChevronDown width={16} height={16} />
                                </button>
                            </div>

                            <div className={styles["month-grid"]}>
                                {MONTHS.map((label, i) => {
                                    const m        = toMonth(year, i);
                                    const selected = m === value;
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`${styles["month-btn"]} ${selected ? styles.selected : ""} ${m === thisMonth ? styles.today : ""}`}
                                            aria-pressed={selected}
                                            aria-label={formatMonthLabel(m)}
                                            disabled={outOfRange(m)}
                                            autoFocus={selected}
                                            onClick={() => choose(m)}>
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {clearable && (
                            <footer className={styles.footer}>
                                <p>{isMonth(value) ? formatMonthLabel(value) : "No month picked"}</p>
                                <button
                                    type="button"
                                    className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                                    disabled={!isMonth(value)}
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
