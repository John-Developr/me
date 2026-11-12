import DashboardCard from "@/components/admin/DashboardCard";
import { ButtonSkeleton, PageHeaderSkeleton } from "@/components/admin/ListSkeletons";
import Skeleton from "@/components/admin/Skeleton";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminSkills.module.css";

const CHIP_WIDTHS = [64, 48, 80, 56, 72, 44, 60];

/** Loading screen for /admin/skills: same header, toolbar, Core Stack list and category cards as SkillsManager. */
export default function SkillsSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading skills">
            <PageHeaderSkeleton page="skills" actions={[140, 112]} />

            <div className={styles.toolbar} aria-hidden="true">
                <Skeleton width={340} height={13} className={styles.summary} />
                <p className={styles.legend}>
                    <span className={styles.core}>★</span> Core Stack <span className={styles.current} /> Right now
                </p>
                <div className={styles.search}>
                    <AdminIcons.Search width={16} height={16} />
                    <input type="search" placeholder="Find a skill" disabled tabIndex={-1} />
                </div>
            </div>

            <DashboardCard
                title="Core Stack"
                icon={AdminIcons.Award}
                subtitle="Featured on /tech-stack; the first 8 show on the home page. Drag to reorder."
                actions={<ButtonSkeleton width={64} />}>
                <ol className={styles["core-list"]} aria-hidden="true">
                    {Array.from({ length: 8 }, (_, i) => (
                        <li key={i} className={styles["core-row"]}>
                            <span className={styles["core-handle"]}><AdminIcons.GripVertical width={16} height={16} /></span>
                            <div className={styles["core-item"]}>
                                <span className={styles["core-rank"]}>{i + 1}</span>
                                <Skeleton width={34} height={34} radius={8} />
                                <span className={`${styles["core-text"]} ${adminStyles["skeleton-fill"]}`}>
                                    <Skeleton width={`${50 - (i % 3) * 8}%`} height={13} />
                                    <Skeleton width={`${80 - (i % 4) * 10}%`} height={11} className={adminStyles["skeleton-gap"]} />
                                </span>
                            </div>
                        </li>
                    ))}
                </ol>
            </DashboardCard>

            <div className={styles.grid} aria-hidden="true">
                {Array.from({ length: 4 }, (_, c) => (
                    <section key={c} className={`${adminStyles.card} ${styles.category}`}>
                        <header className={styles["category-head"]}>
                            <Skeleton width={34} height={34} radius={10} />
                            <div className={`${styles["category-text"]} ${adminStyles["skeleton-fill"]}`}>
                                <Skeleton width="45%" height={15} />
                                <Skeleton width="75%" height={11} className={adminStyles["skeleton-gap"]} />
                            </div>
                        </header>
                        <div className={styles.chips}>
                            {CHIP_WIDTHS.slice(0, 7 - c).map((w, i) => (
                                <span key={i} className={styles.chip}><Skeleton width={w} height={11} /></span>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
