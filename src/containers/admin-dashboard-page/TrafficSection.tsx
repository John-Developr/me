'use client'

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import DashboardCard from "@/components/admin/DashboardCard";
import DateRangePicker from "@/components/admin/DateRangePicker";
import EmptyState from "@/components/admin/EmptyState";
import ErrorState from "@/components/admin/ErrorState";
import LineChart from "@/components/admin/LineChart";
import { ChartSkeleton } from "@/components/admin/ListSkeletons";
import Skeleton from "@/components/admin/Skeleton";
import { useDashboardRefresh } from "@/components/admin/DashboardRefresh";
import { AdminIcons } from "@/components/icons/admin";

import { networkDefine } from "@/config/networkDefine";
import { parseRangeParams, presetToRange, TRAFFIC_PRESETS } from "@/utils/admin/dateRange";
import { formatLongDay, formatNumber, percentChange } from "@/utils/admin/format";
import { FetchStateEnum, TrafficRangePreset, TrafficResult } from "@/utils/types";
import styles from "@/styles/pages/adminDashboard.module.css";

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
    const [rangeError, setRangeError] = useState<string>("");

    const today = presetToRange("7d").to;

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
        setRangeError("");
        setQuery({ range: preset });
    };

    const applyCustom = (from: string, to: string) => {
        const parsed = parseRangeParams({ from, to });

        if (!parsed.ok) {
            setRangeError(parsed.error);
            return;
        }

        setRangeError("");
        setSelection("custom");
        setQuery(parsed.range);
    };

    /** The range the picker shows: the custom one, or the active preset's dates. */
    const shownRange = "from" in query ? query : presetToRange(query.range);

    const isLoading = state === FetchStateEnum.loading;
    const available = result?.available ? result : null;
    const change    = available ? percentChange(available.total, available.previousTotal) : null;

    const presets = (
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
        </div>
    );

    const controls = (
        <div className={styles["traffic-controls"]}>
            {presets}
            <DateRangePicker
                from={shownRange.from}
                to={shownRange.to}
                max={today}
                active={selection === "custom"}
                busy={isLoading}
                onApply={applyCustom} />
        </div>
    );

    return (
        <DashboardCard
            title="Portfolio Traffic"
            icon={AdminIcons.BarChart}
            subtitle={available ? `Daily visitors · ${available.provider}` : "Daily visitors"}
            actions={controls}
            className={styles.traffic}>

            {rangeError && <p className={styles["form-error"]} role="alert">{rangeError}</p>}

            {state === FetchStateEnum.error ? (
                <ErrorState message={error} onRetry={() => load(query)} />
            ) : isLoading && !result ? (
                <div aria-busy="true" aria-label="Loading traffic">
                    <div className={styles["traffic-summary"]}>
                        <Skeleton width={56} height={26} />
                        <Skeleton width={280} height={13} />
                    </div>
                    <ChartSkeleton />
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
                        <Link href="/admin/analytics" className={styles["details-link"]}>Visitor details →</Link>
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
