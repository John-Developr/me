import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import { ButtonSkeleton, PageHeaderSkeleton, ToolbarSkeleton } from "@/components/admin/ListSkeletons";
import Skeleton from "@/components/admin/Skeleton";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminMedia.module.css";

const USAGE_ROWS = ["Images", "PDFs", "Free space", "Per file"];

/** Loading screen for /admin/media: same header, storage + upload cards, file grid and details panel as MediaLibrary. */
export default function MediaSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading media">
            <PageHeaderSkeleton page="media" actions={[176]} />

            <div className={styles.top} aria-hidden="true">
                <section className={styles.usage}>
                    <div className={styles["usage-head"]}>
                        <span className={styles["usage-icon"]}><AdminIcons.Layers width={16} height={16} /></span>
                        <Skeleton width={150} height={14} />
                        <Skeleton width={32} height={14} className={adminStyles["skeleton-end"]} />
                    </div>
                    <div className={styles.bar}><span style={{ width: 0 }} /></div>
                    <Skeleton width="70%" height={12} />
                    <dl className={styles.breakdown}>
                        {USAGE_ROWS.map((label) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd><Skeleton width={90} height={12} /></dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <DashboardCard title="Upload" icon={AdminIcons.Plus}>
                    <div className={styles.uploader}>
                        <div className={styles.dropzone}>
                            <AdminIcons.Image width={22} height={22} />
                            <p><strong>Drag files here</strong> or</p>
                            <ButtonSkeleton width={130} />
                            <Skeleton width={220} height={11} />
                        </div>
                    </div>
                </DashboardCard>
            </div>

            <div className={styles.layout}>
                <DashboardCard title="Files" icon={AdminIcons.Image}>
                    <ToolbarSkeleton filters={["All", "Images", "PDFs"]} search="Search by name or alt text" styles={styles} />
                    <ul className={styles.grid} aria-hidden="true">
                        {Array.from({ length: 8 }, (_, i) => (
                            <li key={i}>
                                <div className={styles.tile}>
                                    <span className={styles.thumb}><Skeleton height="100%" radius={0} /></span>
                                    <Skeleton width={`${80 - (i % 3) * 15}%`} height={13} />
                                    <Skeleton width="55%" height={11} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </DashboardCard>

                <aside className={styles.side}>
                    <DashboardCard title="Details" icon={AdminIcons.FileText}>
                        <EmptyState
                            compact
                            icon={AdminIcons.Image}
                            title="No file selected"
                            description="Select a file to see its details, copy its link, add alt text, or delete it." />
                    </DashboardCard>
                </aside>
            </div>
        </div>
    );
}
