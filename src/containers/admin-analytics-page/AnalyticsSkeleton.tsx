import DashboardCard from "@/components/admin/DashboardCard";
import { ChartSkeleton, PageHeaderSkeleton, StatCardSkeleton } from "@/components/admin/ListSkeletons";
import Skeleton from "@/components/admin/Skeleton";
import { AdminIcons } from "@/components/icons/admin";
import { TRAFFIC_PRESETS } from "@/utils/admin/dateRange";
import { BreakdownDimension } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminAnalytics.module.css";

import { BREAKDOWN_ICONS, BREAKDOWN_SINGULAR, BREAKDOWN_TITLES } from "./labels";

/** Breakdown card with its real title and column heads; rows shimmer. */
function BreakdownSkeleton({ dimension, rows = 5 }: { dimension: BreakdownDimension; rows?: number }) {
    return (
        <DashboardCard title={BREAKDOWN_TITLES[dimension]} icon={BREAKDOWN_ICONS[dimension]}>
            <div className={styles["list-head"]} aria-hidden="true">
                <span>{BREAKDOWN_SINGULAR[dimension]}</span>
                <span>Visitors</span>
            </div>
            <ol className={styles.list} aria-hidden="true">
                {Array.from({ length: rows }, (_, i) => (
                    <li key={i}>
                        <Skeleton width={`${70 - i * 10}%`} height={12} />
                        <Skeleton width={22} height={12} />
                    </li>
                ))}
            </ol>
        </DashboardCard>
    );
}

const VISITOR_COLUMNS = ["Last seen", "Location", "Device", "Source", "Pages", "Time on site"];

/** Loading screen for /admin/analytics: same header, range toolbar, stats, chart, breakdowns and visitors table. */
export default function AnalyticsSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading analytics">
            <PageHeaderSkeleton page="analytics" />

            <div className={styles.toolbar} aria-hidden="true">
                <nav className={styles.segmented}>
                    {Object.keys(TRAFFIC_PRESETS).map((p) => (
                        <button key={p} type="button" disabled tabIndex={-1}>{p.replace("d", " days")}</button>
                    ))}
                    <span className={styles["segment-custom"]}>Custom</span>
                </nav>
                <Skeleton width={200} height={38} radius={10} />
            </div>

            <div className={styles.body}>
                <Skeleton width={260} height={13} className={styles.period} />

                <div className={styles.stats}>
                    <StatCardSkeleton label="Visitors"        icon={AdminIcons.User} />
                    <StatCardSkeleton label="Page views"      icon={AdminIcons.Eye} />
                    <StatCardSkeleton label="Pages per visit" icon={AdminIcons.FileText} />
                    <StatCardSkeleton label="Top country"     icon={AdminIcons.Globe} />
                </div>

                <DashboardCard title="Visitors per day" icon={AdminIcons.BarChart} subtitle={<Skeleton width={190} height={12} />}>
                    <ChartSkeleton />
                </DashboardCard>

                <div className={styles.grid}>
                    {(["country", "city", "referrer", "device", "browser", "os"] as const).map((d) => <BreakdownSkeleton key={d} dimension={d} />)}
                </div>

                <BreakdownSkeleton dimension="path" />

                <DashboardCard
                    title="Recent visitors"
                    icon={AdminIcons.User}
                    subtitle="One row per visitor per day, newest first. Anonymous: no IP addresses or cookies.">
                    <div className={styles["table-wrap"]}>
                        <table className={styles.table} aria-hidden="true">
                            <thead>
                                <tr>
                                    {VISITOR_COLUMNS.map((c, i) => (
                                        <th key={c} scope="col" className={i === VISITOR_COLUMNS.length - 1 ? styles.num : ""}>{c}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 6 }, (_, r) => (
                                    <tr key={r}>
                                        {VISITOR_COLUMNS.map((c, i) => (
                                            <td key={c} data-label={c} className={i === VISITOR_COLUMNS.length - 1 ? styles.num : ""}>
                                                <Skeleton
                                                    width={i === VISITOR_COLUMNS.length - 1 ? 40 : 60 + ((r + i) % 3) * 18}
                                                    height={12}
                                                    className={i === VISITOR_COLUMNS.length - 1 ? adminStyles["skeleton-end"] : ""} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
}
