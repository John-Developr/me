'use client'

import { ReactNode, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import DateRangePicker from "@/components/admin/DateRangePicker";
import { parseRangeParams, TRAFFIC_PRESETS } from "@/utils/admin/dateRange";
import { TrafficRangePreset } from "@/utils/types";
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

    const [error,     setError]     = useState<string>("");
    const [pendingTo, setPendingTo] = useState<string | null>(null);

    const go = (query: string, target: string) => {
        setError("");
        setPendingTo(target);
        startTransition(() => router.push(`${pathname}?${query}`, { scroll: false }));
    };

    const applyCustom = (nextFrom: string, nextTo: string) => {
        const parsed = parseRangeParams({ from: nextFrom, to: nextTo });
        if (!parsed.ok) {
            setError(parsed.error);
            return;
        }
        go(new URLSearchParams({ from: nextFrom, to: nextTo }).toString(), "custom");
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

                <DateRangePicker
                    from={from}
                    to={to}
                    max={today}
                    active={isCustom}
                    busy={isPending}
                    onApply={applyCustom} />
            </div>

            {error && <p className={styles["range-error"]} role="alert">{error}</p>}

            <div className={`${styles.body} ${isPending ? styles.refreshing : ""}`} aria-busy={isPending}>
                {children}
            </div>
        </>
    );
}
