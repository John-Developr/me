'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import ErrorState from "@/components/admin/ErrorState";
import LineChart from "@/components/admin/LineChart";
import Skeleton from "@/components/admin/Skeleton";
import { useDashboardRefresh } from "@/components/admin/DashboardRefresh";
import { AdminIcons } from "@/components/icons/admin";

import { networkDefine } from "@/config/networkDefine";
import { parseRangeParams, presetToRange, TRAFFIC_PRESETS } from "@/utils/admin/dateRange";
import { formatLongDay, formatNumber, percentChange } from "@/utils/admin/format";
import { FetchStateEnum, TrafficRangePreset, TrafficResult } from "@/utils/types";
import styles from "@/styles/pages/adminDashboard.module.css";
import adminStyles from "@/styles/pages/admin.module.css";

type Selection = TrafficRangePreset | "custom";

/** Query string for the traffic API: a preset, or an explicit from/to. */
type RangeQuery = { range: TrafficRangePreset } | { from: string; to: string };

const PRESET_LABELS: Record<TrafficRangePreset, string> = { "7d": "7 days", "30d": "30 days", "90d": "90 days" };

export default function TrafficSection() {
    const { refreshKey } = useDashboardRefresh();

    const [selection, setSelection] = useState<Selection>("30d");
    const [query,     setQuery]     = useState<RangeQuery>({ range: "30d" });
    const [state,     setState]     = useState<FetchStateEnum>(FetchStateEnum.loading);
    const [result,    setResult]    = useState<TrafficResult | null>(null);
    const [error,     setError]     = useState<string>("");

    // Custom range form (defaults to the last 30 days).
    const today = presetToRange("7d").to;
    const [customFrom, setCustomFrom] = useState<string>(presetToRange("30d").from);
    const [customTo,   setCustomTo]   = useState<string>(today);
    const [formError,  setFormError]  = useState<string>("");

    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async (q: RangeQuery) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setState(FetchStateEnum.loading);

        try {
            const params = new URLSearchParams(q as Record<string, string>);
            const res    = await fetch(`${networkDefine.ADMIN_TRAFFIC_API}?${params}`, { signal: controller.signal, cache: "no-store" });
            const json   = await res.json().catch(() => null);

            if (!res.ok || !json?.result) throw new Error(json?.message ?? "Couldn't load traffic data.");

            setResult(json.data as TrafficResult);
            setState(FetchStateEnum.success);
        } catch (err) {
            if (controller.signal.aborted) return;
            setError(err instanceof Error ? err.message : "Couldn't load traffic data.");
            setState(FetchStateEnum.error);
        }
    }, []);

    useEffect(() => {
        load(query);
        return () => abortRef.current?.abort();
    }, [query, refreshKey, load]);

    const selectPreset = (preset: TrafficRangePreset) => {
        setSelection(preset);
        setFormError("");
        setQuery({ range: preset });
    };

    const applyCustom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const parsed = parseRangeParams({ from: customFrom, to: customTo });

        if (!parsed.ok) {
            setFormError(parsed.error);
            return;
        }

        setFormError("");
        setQuery(parsed.range);
    };

    const isLoading = state === FetchStateEnum.loading;
    const available = result?.available ? result : null;
    const change    = available ? percentChange(available.total, available.previousTotal) : null;

    const controls = (
        <div className={styles["range-tabs"]} role="group" aria-label="Date range">
            {(Object.keys(TRAFFIC_PRESETS) as TrafficRangePreset[]).map((preset) => (
                <button
                    key={preset}
                    type="button"
                    aria-pressed={selection === preset}
                    className={selection === preset ? styles.selected : ""}
                    onClick={() => selectPreset(preset)}>
                    {PRESET_LABELS[preset]}
                </button>
            ))}
            <button
                type="button"
                aria-pressed={selection === "custom"}
                className={selection === "custom" ? styles.selected : ""}
                onClick={() => setSelection("custom")}>
                Custom
            </button>
        </div>
    );

    return (
        <DashboardCard
            title="Portfolio Traffic"
            icon={AdminIcons.BarChart}
            subtitle={available ? `Daily visitors · ${available.provider}` : "Daily visitors"}
            actions={controls}
            className={styles.traffic}>

            {selection === "custom" && (
                <form className={styles["custom-range"]} onSubmit={applyCustom} noValidate>
                    <label>
                        <span>From</span>
                        <input type="date" value={customFrom} max={customTo || today} onChange={(e) => setCustomFrom(e.target.value)} required />
                    </label>
                    <label>
                        <span>To</span>
                        <input type="date" value={customTo} min={customFrom} max={today} onChange={(e) => setCustomTo(e.target.value)} required />
                    </label>
                    <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}>Apply</button>
                    {formError && <p className={styles["form-error"]} role="alert">{formError}</p>}
                </form>
            )}

            {state === FetchStateEnum.error ? (
                <ErrorState message={error} onRetry={() => load(query)} />
            ) : isLoading && !result ? (
                <div className={styles["chart-skeleton"]} aria-busy="true" aria-label="Loading traffic">
                    <Skeleton width={140} height={28} />
                    <Skeleton height={220} radius={10} />
                </div>
            ) : result && !result.available ? (
                <EmptyState
                    icon={AdminIcons.BarChart}
                    title="Analytics isn't connected"
                    description={result.reason} />
            ) : available ? (
                <div className={isLoading ? styles.refetching : ""} aria-busy={isLoading}>
                    <div className={styles["traffic-summary"]}>
                        <strong>{formatNumber(available.total)}</strong>
                        <span>visitors · {formatNumber(available.totalViews)} page views · {formatLongDay(available.range.from)} – {formatLongDay(available.range.to)}</span>
                        {change !== null && (
                            <span className={change > 0 ? styles.up : styles.down}>
                                {change > 0 ? "+" : ""}{change}% vs previous period
                            </span>
                        )}
                    </div>

                    {available.total === 0 && (
                        <p className={styles.muted}>
                            No visits recorded in this period yet. Visits are counted on the live site from now on
                            (not from local development, bots, or while you&apos;re signed in to the admin).
                        </p>
                    )}

                    <LineChart
                        points={available.points}
                        unit="visitors"
                        ariaLabel={`Daily visitors from ${formatLongDay(available.range.from)} to ${formatLongDay(available.range.to)}. Total ${formatNumber(available.total)}.`} />
                </div>
            ) : null}
        </DashboardCard>
    );
}
