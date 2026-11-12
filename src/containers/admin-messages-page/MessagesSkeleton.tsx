import DashboardCard from "@/components/admin/DashboardCard";
import { PageHeaderSkeleton, ToolbarSkeleton } from "@/components/admin/ListSkeletons";
import Skeleton from "@/components/admin/Skeleton";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import mediaStyles from "@/styles/pages/adminMedia.module.css";
import styles from "@/styles/pages/adminMessages.module.css";

/** Loading screen for /admin/messages: same header, card, toolbar and inbox rows as MessagesInbox. */
export default function MessagesSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading messages">
            <PageHeaderSkeleton page="messages" />
            <DashboardCard title="Messages" icon={AdminIcons.Mail}>
                <ToolbarSkeleton filters={["Inbox", "Unread", "Archived"]} search="Search messages" styles={mediaStyles} />
                <ul className={styles.list} aria-hidden="true">
                    {Array.from({ length: 7 }, (_, i) => (
                        <li key={i} className={styles.row}>
                            <div className={styles["row-link"]}>
                                <span className={styles.avatar}><Skeleton width={32} height={32} radius="50%" /></span>
                                <span className={styles.sender}><Skeleton width={`${70 - (i % 3) * 12}%`} height={13} /></span>
                                <span className={styles.summary}><Skeleton width={`${88 - (i % 4) * 9}%`} height={13} /></span>
                                <span className={styles.time}><Skeleton width={44} height={11} /></span>
                            </div>
                        </li>
                    ))}
                </ul>
            </DashboardCard>
        </div>
    );
}
