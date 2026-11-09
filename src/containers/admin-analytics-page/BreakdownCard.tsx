import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import { AdminIconComponent } from "@/components/icons/admin";
import { formatNumber } from "@/utils/admin/format";
import { BreakdownDimension, BreakdownRow } from "@/utils/types";
import styles from "@/styles/pages/adminAnalytics.module.css";

import { BREAKDOWN_SINGULAR, BREAKDOWN_TITLES, breakdownLabel } from "./labels";

interface BreakdownCardProps {
    dimension: BreakdownDimension;
    rows:      BreakdownRow[];
    icon:      AdminIconComponent;
}

/** "Top N" list with a bar proportional to visitors. */
export default function BreakdownCard({ dimension, rows, icon }: BreakdownCardProps) {
    const max = Math.max(1, ...rows.map((r) => r.visitors));

    return (
        <DashboardCard title={BREAKDOWN_TITLES[dimension]} icon={icon}>
            {rows.length === 0 ? (
                <EmptyState compact icon={icon} title="No data yet" description="Nothing recorded in this period." />
            ) : (
                <>
                    <div className={styles["list-head"]} aria-hidden="true">
                        <span>{BREAKDOWN_SINGULAR[dimension]}</span>
                        <span>Visitors</span>
                    </div>
                    <ol className={styles.list}>
                        {rows.map((row) => (
                            <li key={row.label || "unknown"} title={`${formatNumber(row.visitors)} visitors · ${formatNumber(row.views)} page views`}>
                                <span className={styles.bar} style={{ width: `${(row.visitors / max) * 100}%` }} aria-hidden="true" />
                                <span className={`${styles.label} ${row.label ? "" : styles.muted}`}>{breakdownLabel(dimension, row.label)}</span>
                                <span className={styles.value}>{formatNumber(row.visitors)}</span>
                            </li>
                        ))}
                    </ol>
                </>
            )}
        </DashboardCard>
    );
}
