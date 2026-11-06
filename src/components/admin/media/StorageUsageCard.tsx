import { AdminIcons } from "@/components/icons/admin";
import { formatBytes, MAX_UPLOAD_BYTES, toGB } from "@/utils/media";
import { StorageUsage } from "@/utils/types";
import styles from "@/styles/pages/adminMedia.module.css";

export interface StorageBreakdownRow {
    label: string;
    files: number;
    bytes: number;
}

interface StorageUsageCardProps {
    usage:      StorageUsage;
    compact?:   boolean;
    /** Per-type totals (full card only), e.g. Images / PDFs. */
    breakdown?: StorageBreakdownRow[];
}

/** "0.12 GB of 1.00 GB used" with a bar that warns near the limit. */
export default function StorageUsageCard({ usage, compact, breakdown }: StorageUsageCardProps) {
    const pct   = usage.limitBytes > 0 ? Math.min(100, (usage.usedBytes / usage.limitBytes) * 100) : 0;
    const level = pct >= 95 ? styles.full : pct >= 80 ? styles.warn : "";
    const left  = Math.max(0, usage.limitBytes - usage.usedBytes);

    return (
        <section className={`${styles.usage} ${compact ? styles.compact : ""}`} aria-label="Storage usage">
            <div className={styles["usage-head"]}>
                <span className={styles["usage-icon"]}><AdminIcons.Layers width={16} height={16} /></span>
                <p>
                    <strong>{toGB(usage.usedBytes)} GB</strong> of {toGB(usage.limitBytes)} GB used
                </p>
                <span className={styles["usage-pct"]}>{pct < 1 && usage.usedBytes > 0 ? "<1" : Math.round(pct)}%</span>
            </div>

            <div
                className={`${styles.bar} ${level}`}
                role="meter"
                aria-label="Storage used"
                aria-valuemin={0}
                aria-valuemax={usage.limitBytes}
                aria-valuenow={usage.usedBytes}
                aria-valuetext={`${formatBytes(usage.usedBytes)} of ${formatBytes(usage.limitBytes)}`}>
                <span style={{ width: `${Math.max(pct, usage.usedBytes > 0 ? 0.5 : 0)}%` }} />
            </div>

            <p className={styles["usage-meta"]}>
                {usage.fileCount} file{usage.fileCount === 1 ? "" : "s"} · {formatBytes(usage.usedBytes)} used · {formatBytes(left)} free
                {pct >= 95 ? " · Storage almost full: delete unused files." : pct >= 80 ? " · Getting close to the limit." : ""}
            </p>

            {!compact && breakdown && (
                <dl className={styles.breakdown}>
                    {breakdown.map((row) => (
                        <div key={row.label}>
                            <dt>{row.label}</dt>
                            <dd>{row.files} file{row.files === 1 ? "" : "s"} · {formatBytes(row.bytes)}</dd>
                        </div>
                    ))}
                    <div>
                        <dt>Free space</dt>
                        <dd>{formatBytes(left)}</dd>
                    </div>
                    <div>
                        <dt>Per file</dt>
                        <dd>up to {formatBytes(MAX_UPLOAD_BYTES)}</dd>
                    </div>
                </dl>
            )}
        </section>
    );
}
