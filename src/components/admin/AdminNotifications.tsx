'use client'

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";

import TimeAgo from "./TimeAgo";
import { useDismiss } from "@/hooks/useDismiss";
import { AdminIcons } from "@/components/icons/admin";
import { senderName } from "@/utils/admin/messageSchema";
import { MessageNotifications } from "@/utils/types";
import styles from "@/styles/pages/admin.module.css";

const MESSAGES_PATH = "/admin/messages";

interface AdminNotificationsProps {
    /** Unread contact messages; null when they couldn't be loaded. */
    notifications: MessageNotifications | null;
}

/**
 * Bell with a dot when there are unread contact messages. The popover
 * lists the latest unread ones; each opens in the Contact Messages inbox.
 */
export default function AdminNotifications({ notifications }: AdminNotificationsProps) {
    const [open, setOpen] = useState<boolean>(false);
    const rootRef         = useRef<HTMLDivElement>(null);
    const panelId         = useId();

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    const count     = notifications?.count ?? 0;
    const hasUnread = count > 0;
    const more      = count - (notifications?.latest.length ?? 0);
    const label     = hasUnread ? `Notifications: ${count} new message${count === 1 ? "" : "s"}` : "Notifications";

    return (
        <div ref={rootRef} className={styles.popover}>
            <button
                type="button"
                className={styles["icon-btn"]}
                aria-label={label}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((v) => !v)}>
                <AdminIcons.Bell />
                {hasUnread && <span className={styles["notif-dot"]} aria-hidden="true" />}
            </button>

            {open && (
                <div id={panelId} className={`${styles["popover-panel"]} ${styles["notif-panel"]}`} role="dialog" aria-label="Notifications">
                    <p className={styles["popover-title"]}>
                        Notifications
                        {hasUnread && <span className={styles["notif-count"]}>{count} new</span>}
                    </p>

                    {notifications === null ? (
                        <p className={styles["popover-empty"]}>Couldn&apos;t load notifications. Try refreshing.</p>
                    ) : hasUnread ? (
                        <ul className={styles["notif-list"]}>
                            {notifications.latest.map((m) => (
                                <li key={m.id}>
                                    <Link href={`${MESSAGES_PATH}/${m.id}`} className={`${styles["notif-item"]} ${styles["notif-link"]}`} onClick={close}>
                                        <span className={styles["notif-icon"]}><AdminIcons.Mail width={16} height={16} /></span>
                                        <div>
                                            <p><strong>{senderName(m)}</strong></p>
                                            <small className={styles["notif-subject"]}>{m.subject}</small>
                                            <small><TimeAgo iso={m.created_at} /></small>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles["popover-empty"]}>You&apos;re all caught up — no new messages.</p>
                    )}

                    {notifications !== null && (
                        <Link href={MESSAGES_PATH} className={styles["notif-footer"]} onClick={close}>
                            {more > 0 ? `View all messages (${more} more unread)` : "View all messages"}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
