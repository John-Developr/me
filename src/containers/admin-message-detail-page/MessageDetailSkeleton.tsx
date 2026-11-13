import Link from "next/link";

import Skeleton from "@/components/admin/Skeleton";
import { AdminIcons } from "@/components/icons/admin";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminMessages.module.css";

/**
 * Loading screen for /admin/messages/[id]: the same toolbar and email card
 * as MessageView; the subject, sender, date and body shimmer.
 */
export default function MessageDetailSkeleton() {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading message">
            <div className={styles.toolbar}>
                <Link href="/admin/messages" className={adminStyles["btn-ghost"]}>
                    <AdminIcons.ArrowLeft width={15} height={15} />
                    Back to inbox
                </Link>

                <div className={styles["toolbar-actions"]}>
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} disabled tabIndex={-1}>
                        <AdminIcons.Mail width={15} height={15} />
                        <span className={styles["action-label"]}>Mark unread</span>
                    </button>
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} disabled tabIndex={-1}>
                        <AdminIcons.Archive width={15} height={15} />
                        <span className={styles["action-label"]}>Archive</span>
                    </button>
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]} ${styles.danger}`} disabled tabIndex={-1} aria-label="Delete message">
                        <AdminIcons.Trash width={15} height={15} />
                        <span className={styles["action-label"]}>Delete</span>
                    </button>
                </div>
            </div>

            <article className={`${adminStyles.card} ${styles.email}`}>
                <header className={styles["email-head"]}>
                    <h2 className={styles["email-subject"]}><Skeleton width="55%" height={22} /></h2>
                </header>

                <div className={styles["email-from"]}>
                    <Skeleton width={40} height={40} radius="50%" />
                    <div className={styles["from-text"]}>
                        <p><Skeleton width={220} height={14} /></p>
                        <p className={styles["from-to"]}>to you · via the contact form</p>
                    </div>
                    <p className={styles["email-date"]}><Skeleton width={150} height={12} /></p>
                </div>

                <div className={`${styles["email-body"]} ${styles["body-skeleton"]}`}>
                    <Skeleton height={14} />
                    <Skeleton height={14} />
                    <Skeleton width="85%" height={14} />
                    <Skeleton width="60%" height={14} />
                </div>

                <div className={styles["email-reply"]}>
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled tabIndex={-1}>
                        <AdminIcons.Reply width={15} height={15} />
                        Reply
                    </button>
                    <small><Skeleton width={260} height={12} /></small>
                </div>
            </article>
        </div>
    );
}
