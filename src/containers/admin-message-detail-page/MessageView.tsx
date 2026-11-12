'use client'

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { deleteMessage, updateMessageStatus } from "@/containers/admin-messages-page/messageActions";
import { formatDateTime } from "@/utils/admin/format";
import { replyMailto, senderName } from "@/utils/admin/messageSchema";
import { ContactMessage } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminMessages.module.css";

const INBOX = "/admin/messages";

/** A contact message laid out like an email, with reply and triage actions. */
export default function MessageView({ message }: { message: ContactMessage }) {
    const router = useRouter();

    const [busy,       setBusy]       = useState<boolean>(false);
    const [confirming, setConfirming] = useState<boolean>(false);

    const name     = senderName(message);
    const archived = message.status === "archived";

    // Opening an unread message marks it read (once; "Mark unread" isn't undone).
    const markedRead = useRef<boolean>(false);
    useEffect(() => {
        if (message.status !== "new" || markedRead.current) return;
        markedRead.current = true;
        updateMessageStatus(message.id, "read", { quiet: true }).then((ok) => { if (ok) router.refresh(); });
    }, [message.id, message.status, router]);

    /** Like an email client: unread / archive / delete return to the inbox. */
    const run = async (action: () => Promise<boolean>, backToInbox: boolean) => {
        setBusy(true);
        const ok = await action();
        setBusy(false);
        if (!ok) return;
        // Dynamic admin pages aren't cached by the router, so the inbox loads fresh.
        if (backToInbox) router.push(INBOX);
        else router.refresh();
    };

    return (
        <>
            <div className={styles.toolbar}>
                <Link href={INBOX} className={adminStyles["btn-ghost"]}>
                    <AdminIcons.ArrowLeft width={15} height={15} />
                    Back to inbox
                </Link>

                <div className={styles["toolbar-actions"]}>
                    {!archived && (
                        <button
                            type="button"
                            className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                            disabled={busy}
                            onClick={() => run(() => updateMessageStatus(message.id, "new"), true)}>
                            <AdminIcons.Mail width={15} height={15} />
                            <span className={styles["action-label"]}>Mark unread</span>
                        </button>
                    )}
                    <button
                        type="button"
                        className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                        disabled={busy}
                        onClick={() => archived
                            ? run(() => updateMessageStatus(message.id, "read", { toast: "Moved to inbox" }), false)
                            : run(() => updateMessageStatus(message.id, "archived"), true)}>
                        {archived ? <AdminIcons.Inbox width={15} height={15} /> : <AdminIcons.Archive width={15} height={15} />}
                        <span className={styles["action-label"]}>{archived ? "Move to inbox" : "Archive"}</span>
                    </button>
                    <button
                        type="button"
                        className={`liquid_glass_btn ${adminStyles["btn-secondary"]} ${styles.danger}`}
                        disabled={busy}
                        aria-label="Delete message"
                        onClick={() => setConfirming(true)}>
                        <AdminIcons.Trash width={15} height={15} />
                        <span className={styles["action-label"]}>Delete</span>
                    </button>
                </div>
            </div>

            <article className={`${adminStyles.card} ${styles.email}`}>
                <header className={styles["email-head"]}>
                    <h2 className={styles["email-subject"]}>{message.subject}</h2>
                    <div className={styles.labels}>
                        {message.inquiry_type && <span className={styles.chip}>{message.inquiry_type}</span>}
                        {archived && <span className={styles.chip}>Archived</span>}
                    </div>
                </header>

                <div className={styles["email-from"]}>
                    <span className={`${styles.avatar} ${styles["avatar-lg"]}`} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
                    <div className={styles["from-text"]}>
                        <p>
                            <strong>{name}</strong>{" "}
                            <span className={styles["from-email"]}>&lt;{message.email}&gt;</span>
                        </p>
                        <p className={styles["from-to"]}>to you · via the contact form</p>
                    </div>
                    <p className={styles["email-date"]}>
                        <time dateTime={message.created_at} suppressHydrationWarning>{formatDateTime(message.created_at)}</time>
                        <span> (<TimeAgo iso={message.created_at} />)</span>
                    </p>
                </div>

                <div className={styles["email-body"]}>{message.message}</div>

                {(message.inquiry_type || message.budget) && (
                    <dl className={styles["email-facts"]}>
                        {message.inquiry_type && <div><dt>Inquiry type</dt><dd>{message.inquiry_type}</dd></div>}
                        {message.budget && <div><dt>Budget</dt><dd>{message.budget}</dd></div>}
                    </dl>
                )}

                <div className={styles["email-reply"]}>
                    <a href={replyMailto(message)} className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}>
                        <AdminIcons.Reply width={15} height={15} />
                        Reply
                    </a>
                    <small>Opens your email app with the reply addressed to {message.email}.</small>
                </div>
            </article>

            <ConfirmDialog
                open={confirming}
                danger
                title="Delete this message?"
                description={<>The message from <strong>{name}</strong> will be removed from your inbox. The copy in your email isn&apos;t affected. This can&apos;t be undone.</>}
                confirmLabel="Delete message"
                busy={busy}
                onConfirm={() => { setConfirming(false); run(() => deleteMessage(message.id, message.subject), true); }}
                onCancel={() => setConfirming(false)} />
        </>
    );
}
