import Skeleton from "@/components/admin/Skeleton";
import styles from "@/styles/pages/adminDashboard.module.css";
import adminStyles from "@/styles/pages/admin.module.css";

/** Six stat-card placeholders, same footprint as the real grid. */
export function StatsSkeleton() {
    return (
        <div className={styles.stats} aria-busy="true" aria-label="Loading statistics">
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={adminStyles.stat}>
                    <Skeleton width="55%" height={12} />
                    <Skeleton width={64} height={28} />
                    <Skeleton width="70%" height={11} />
                </div>
            ))}
        </div>
    );
}

/** Card placeholder with a title bar and `rows` list lines. */
export function CardSkeleton({ rows = 4 }: { rows?: number }) {
    return (
        <div className={adminStyles.card} aria-busy="true" aria-label="Loading">
            <div className={styles["skeleton-head"]}>
                <Skeleton width={28} height={28} radius={8} />
                <Skeleton width={140} height={14} />
            </div>
            <div className={styles["skeleton-rows"]}>
                {Array.from({ length: rows }, (_, i) => (
                    <div key={i} className={styles["skeleton-row"]}>
                        <Skeleton width={30} height={30} radius={8} />
                        <div>
                            <Skeleton width={`${80 - i * 8}%`} height={12} />
                            <Skeleton width="35%" height={10} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
