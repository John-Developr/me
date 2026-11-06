'use client'

import { useCallback, useId, useRef, useState } from "react";

import { useDismiss } from "@/hooks/useDismiss";
import { AdminIcons } from "@/components/icons/admin";
import styles from "@/styles/pages/admin.module.css";

interface AdminNotificationsProps {
    /** Unread contact messages; null when the count couldn't be loaded. */
    newMessages: number | null;
}

/**
 * Bell with a dot when there are unread contact messages.
 * The inbox isn't built yet, so the popover only reports the count.
 */
export default function AdminNotifications({ newMessages }: AdminNotificationsProps) {
    const [open, setOpen] = useState<boolean>(false);
    const rootRef         = useRef<HTMLDivElement>(null);
    const panelId         = useId();

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    const hasUnread = (newMessages ?? 0) > 0;
    const label     = hasUnread ? `Notifications: ${newMessages} new message${newMessages === 1 ? "" : "s"}` : "Notifications";

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
                    <p className={styles["popover-title"]}>Notifications</p>

                    {newMessages === null ? (
                        <p className={styles["popover-empty"]}>Couldn&apos;t load notifications. Try refreshing.</p>
                    ) : hasUnread ? (
                        <div className={styles["notif-item"]}>
                            <span className={styles["notif-icon"]}><AdminIcons.Mail width={16} height={16} /></span>
                            <div>
                                <p><strong>{newMessages}</strong> new contact message{newMessages === 1 ? "" : "s"}</p>
                                <small>The Contact Messages inbox is coming soon. Messages are also emailed to you.</small>
                            </div>
                        </div>
                    ) : (
                        <p className={styles["popover-empty"]}>You&apos;re all caught up — no new messages.</p>
                    )}
                </div>
            )}
        </div>
    );
}
