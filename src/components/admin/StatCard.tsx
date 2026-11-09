import { ReactNode } from "react";

import { AdminIconComponent } from "@/components/icons/admin";
import { formatNumber } from "@/utils/admin/format";
import styles from "@/styles/pages/admin.module.css";

interface StatCardProps {
    label:  string;
    icon:   AdminIconComponent;
    /** null = not available (e.g. no analytics provider); shown as a dash, never a guess. */
    value:  number | null;
    /** Text to show instead of a number (e.g. "1.8" or "🇵🇭 Philippines"). */
    display?: string;
    /** Secondary line: a real comparison, an empty hint, or why the value is missing. */
    hint?:  ReactNode;
    /** Positive trend text gets the success color. */
    trend?: "up" | "neutral";
}

/** A single headline number. */
export default function StatCard({ label, icon: Icon, value, display, hint, trend = "neutral" }: StatCardProps) {
    return (
        <article className={styles.stat}>
            <div className={styles["stat-top"]}>
                <p className={styles["stat-label"]} title={label}>{label}</p>
                <span className={styles["stat-icon"]}><Icon width={16} height={16} /></span>
            </div>

            <p className={`${styles["stat-value"]} ${value === null && !display ? styles.unavailable : ""} ${display ? styles["stat-text"] : ""}`}>
                {display ?? (value === null ? "—" : formatNumber(value))}
            </p>

            {hint && (
                <p className={`${styles["stat-hint"]} ${trend === "up" ? styles.up : ""}`}>{hint}</p>
            )}
        </article>
    );
}
