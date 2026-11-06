'use client'

import { KeyboardEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";

import { TrafficPoint } from "@/utils/types";
import { labelIndexes, linePath, nearestIndex, niceMax, toChartPoints, yTicks } from "@/utils/admin/chartScale";
import { formatLongDay, formatNumber, formatShortDay } from "@/utils/admin/format";
import styles from "@/styles/pages/admin.module.css";

interface LineChartProps {
    points:     TrafficPoint[];
    /** Unit for tooltips and the table, e.g. "visitors". */
    unit:       string;
    ariaLabel:  string;
    height?:    number;
}

const MARGIN = { top: 12, right: 12, bottom: 28, left: 44 };

/**
 * Single-series line chart (dependency-free SVG).
 * Crosshair + tooltip snap to the nearest day; arrow keys move it when focused.
 * A table view carries every value for screen readers and non-hover use.
 */
export default function LineChart({ points, unit, ariaLabel, height = 260 }: LineChartProps) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [width,  setWidth]  = useState<number>(0);
    const [active, setActive] = useState<number | null>(null);
    const [showTable, setShowTable] = useState<boolean>(false);

    // Measure the container so the SVG draws at real pixel size (crisp text, no stretching).
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { coords, path, ticks, max, xLabels } = useMemo(() => {
        const values = points.map((p) => p.visitors);
        const max    = niceMax(Math.max(0, ...values));
        const coords = width > 0 ? toChartPoints(values, max, { width, height, ...MARGIN }) : [];

        return {
            coords,
            path:    linePath(coords),
            ticks:   yTicks(max),
            max,
            xLabels: labelIndexes(points.length, width < 480 ? 4 : 7),
        };
    }, [points, width, height]);

    const plotBottom = height - MARGIN.bottom;
    const yFor       = (value: number) => MARGIN.top + (plotBottom - MARGIN.top) * (1 - value / max);

    const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (coords.length) setActive(nearestIndex(coords, e.clientX - rect.left));
    };

    const handleKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
        if (!coords.length) return;
        const last = coords.length - 1;

        if (e.key === "ArrowRight") setActive((i) => (i === null ? 0 : Math.min(i + 1, last)));
        else if (e.key === "ArrowLeft") setActive((i) => (i === null ? last : Math.max(i - 1, 0)));
        else if (e.key === "Home") setActive(0);
        else if (e.key === "End")  setActive(last);
        else return;

        e.preventDefault();
    };

    const activePoint = active !== null ? coords[active] : null;
    const activeDatum = active !== null ? points[active] : null;

    // Keep the tooltip inside the chart horizontally.
    const tooltipLeft = activePoint ? Math.min(Math.max(activePoint.x, 70), Math.max(width - 70, 70)) : 0;

    return (
        <div className={styles.chart}>
            <div ref={wrapRef} className={styles["chart-canvas"]} style={{ height }}>
                {width > 0 && (
                    <svg
                        width={width}
                        height={height}
                        role="img"
                        aria-label={ariaLabel}
                        tabIndex={0}
                        onPointerMove={handlePointerMove}
                        onPointerLeave={() => setActive(null)}
                        onFocus={() => setActive((i) => i ?? coords.length - 1)}
                        onBlur={() => setActive(null)}
                        onKeyDown={handleKeyDown}>

                        {/* Gridlines + y labels */}
                        {ticks.map((tick) => (
                            <g key={tick}>
                                <line
                                    className={styles["chart-grid"]}
                                    x1={MARGIN.left} x2={width - MARGIN.right}
                                    y1={yFor(tick)}   y2={yFor(tick)} />
                                <text className={styles["chart-axis"]} x={MARGIN.left - 8} y={yFor(tick)} dy="0.32em" textAnchor="end">
                                    {formatNumber(tick)}
                                </text>
                            </g>
                        ))}

                        {/* X labels */}
                        {xLabels.map((i) => coords[i] && (
                            <text
                                key={points[i].date}
                                className={styles["chart-axis"]}
                                x={coords[i].x}
                                y={height - 8}
                                textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}>
                                {formatShortDay(points[i].date)}
                            </text>
                        ))}

                        {/* Crosshair (under the line) */}
                        {activePoint && (
                            <line
                                className={styles["chart-crosshair"]}
                                x1={activePoint.x} x2={activePoint.x}
                                y1={MARGIN.top}    y2={plotBottom} />
                        )}

                        <path className={styles["chart-line"]} d={path} />

                        {activePoint && (
                            <circle className={styles["chart-dot"]} cx={activePoint.x} cy={activePoint.y} r={5} />
                        )}
                    </svg>
                )}

                {activePoint && activeDatum && (
                    <div
                        className={styles["chart-tooltip"]}
                        style={{ left: tooltipLeft, top: Math.max(activePoint.y - 12, 0) }}
                        aria-hidden="true">
                        <strong>{formatNumber(activeDatum.visitors)}</strong>
                        <span>{unit} · {formatLongDay(activeDatum.date)}</span>
                    </div>
                )}

                {/* Announce the focused day for keyboard / screen reader users. */}
                <p className={styles["sr-only"]} aria-live="polite">
                    {activeDatum ? `${formatLongDay(activeDatum.date)}: ${formatNumber(activeDatum.visitors)} ${unit}` : ""}
                </p>
            </div>

            <button
                type="button"
                className={styles["text-btn"]}
                aria-expanded={showTable}
                onClick={() => setShowTable((v) => !v)}>
                {showTable ? "Hide data table" : "Show data table"}
            </button>

            {showTable && (
                <div className={styles["chart-table-wrap"]}>
                    <table className={styles["chart-table"]}>
                        <thead>
                            <tr><th scope="col">Date</th><th scope="col">{unit}</th></tr>
                        </thead>
                        <tbody>
                            {[...points].reverse().map((p) => (
                                <tr key={p.date}>
                                    <td>{formatLongDay(p.date)}</td>
                                    <td>{formatNumber(p.visitors)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
