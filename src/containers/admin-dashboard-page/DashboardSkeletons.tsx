import DashboardCard from "@/components/admin/DashboardCard";
import { StatCardSkeleton } from "@/components/admin/ListSkeletons";
import Skeleton from "@/components/admin/Skeleton";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminDashboard.module.css";

/* Fallbacks for the dashboard's Suspense sections. Each one renders the
   section's real card (title, icon, labels) and shimmers only the data. */

/** The six stat cards with their real labels and icons (see StatsSection). */
export function StatsSkeleton() {
    return (
        <div className={styles.stats} aria-busy="true" aria-label="Loading statistics">
            <StatCardSkeleton label="Total Projects"     icon={AdminIcons.Folder} />
            <StatCardSkeleton label="Published Projects" icon={AdminIcons.Globe} />
            <StatCardSkeleton label="Work Experience"    icon={AdminIcons.Briefcase} />
            <StatCardSkeleton label="Total Skills"       icon={AdminIcons.Code} />
            <StatCardSkeleton label="New Messages"       icon={AdminIcons.Mail} />
            <StatCardSkeleton label="Portfolio Views"    icon={AdminIcons.Eye} />
        </div>
    );
}

const OVERVIEW_ROWS = ["Published projects", "Draft projects", "Experience entries", "Skills", "Last content update"];

/** Content Overview card (see ContentOverviewSection). */
export function ContentOverviewSkeleton() {
    return (
        <DashboardCard title="Content Overview" icon={AdminIcons.FileText} subtitle="Publishing status of your portfolio">
            <dl className={styles.overview} aria-busy="true" aria-label="Loading content overview">
                {OVERVIEW_ROWS.map((label) => (
                    <div key={label}>
                        <dt>{label}</dt>
                        <dd><Skeleton width={label === "Last content update" ? 70 : 24} height={14} /></dd>
                    </div>
                ))}
            </dl>
            <div className={styles.completion} aria-hidden="true">
                <div className={styles["completion-head"]}>
                    <p>Profile completion</p>
                    <Skeleton width={40} height={18} />
                </div>
                <div className={styles.progress}><span style={{ width: 0 }} /></div>
                <Skeleton width={130} height={13} />
            </div>
        </DashboardCard>
    );
}

/** Recent Activity card (see ActivitySection). */
export function ActivitySkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <DashboardCard
            title="Recent Activity"
            icon={AdminIcons.Activity}
            subtitle="Latest changes and messages, newest first"
            className={styles["activity-card"]}>
            <ol className={styles.activity} aria-busy="true" aria-label="Loading activity">
                {Array.from({ length: rows }, (_, i) => (
                    <li key={i}>
                        <Skeleton width={30} height={30} radius={8} />
                        <div className={`${styles["activity-body"]} ${adminStyles["skeleton-fill"]}`}>
                            <Skeleton width={`${85 - (i % 3) * 15}%`} height={14} />
                            <small><Skeleton width={56} height={16} radius={999} /><Skeleton width={60} height={11} /></small>
                        </div>
                    </li>
                ))}
            </ol>
        </DashboardCard>
    );
}
