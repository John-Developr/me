'use client'

import { FormEvent, ReactNode, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AdminIcons } from "@/components/icons/admin";
import { parseRangeParams, TRAFFIC_PRESETS } from "@/utils/admin/dateRange";
import { TrafficRangePreset } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminAnalytics.module.css";

interface AnalyticsFrameProps {
    /** Active preset, or null for a custom range. */
    preset:   TrafficRangePreset | null;
    from:     string;
    to:       string;
    today:    string;
    children: ReactNode;
}

/**
 * Range toolbar + page body. Changing the range updates the URL with a soft
 * navigation (no full reload): the server re-renders the data while the
 * current numbers stay on screen, dimmed.
 */
export default function AnalyticsFrame({ preset, from, to, today, children }: AnalyticsFrameProps) {
    const router   = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const [fromValue, setFromValue] = useState<string>(from);
    const [toValue,   setToValue]   = useState<string>(to);
    const [error,     setError]     = useState<string>("");
    const [pendingTo, setPendingTo] = useState<string | null>(null);

    const go = (query: string, target: string) => {
        setError("");
        setPendingTo(target);
        startTransition(() => router.push(`${pathname}?${query}`, { scroll: false }));
    };

    const applyCustom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const parsed = parseRangeParams({ from: fromValue, to: toValue });
        if (!parsed.ok) {
            setError(parsed.error);
            return;
        }
        go(new URLSearchParams({ from: fromValue, to: toValue }).toString(), "custom");
    };

    const isCustom = !preset;
    const busy     = (target: string) => isPending && pendingTo === target;

    return (
        <>
            <div className={styles.toolbar}>
                <nav className={styles.segmented} aria-label="Date range">
                    {(Object.keys(TRAFFIC_PRESETS) as TrafficRangePreset[]).map((p) => (
                        <button
                            key={p}
                            type="button"
                            className={`${preset === p ? styles.on : ""} ${busy(p) ? styles.loading : ""}`}
                            aria-pressed={preset === p}
                            disabled={isPending}
                            onClick={() => { if (preset !== p) go(`range=${p}`, p); }}>
                            {p.replace("d", " days")}
                        </button>
                    ))}
                    <span className={`${styles["segment-custom"]} ${isCustom ? styles.on : ""}`} aria-hidden={!isCustom}>
                        Custom
                    </span>
                </nav>

                <form className={`${styles.range} ${isCustom ? styles.active : ""} ${error ? styles.invalid : ""}`} onSubmit={applyCustom} aria-label="Custom date range" noValidate>
                    <AdminIcons.Clock width={16} height={16} aria-hidden="true" />
                    <label>
                        <span className={adminStyles["sr-only"]}>From</span>
                        <input type="date" value={fromValue} max={toValue || today} onChange={(e) => { setFromValue(e.target.value); setError(""); }} />
                    </label>
                    <span className={styles.arrow} aria-hidden="true">→</span>
                    <label>
                        <span className={adminStyles["sr-only"]}>To</span>
                        <input type="date" value={toValue} min={fromValue} max={today} onChange={(e) => { setToValue(e.target.value); setError(""); }} />
                    </label>
                    <button type="submit" className={styles.apply} disabled={isPending}>
                        {busy("custom") ? "Loading…" : "Apply"}
                    </button>
                </form>
            </div>

            {error && <p className={styles["range-error"]} role="alert">{error}</p>}

            <div className={`${styles.body} ${isPending ? styles.refreshing : ""}`} aria-busy={isPending}>
                {children}
            </div>
        </>
    );
}
