'use client'

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { matchesMessage, senderName } from "@/utils/admin/messageSchema";
import { ContactMessage, MessageStatus } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import mediaStyles from "@/styles/pages/adminMedia.module.css";
import styles from "@/styles/pages/adminMessages.module.css";

import { updateMessageStatus } from "./messageActions";

type Filter = "inbox" | "unread" | "archived";

const FILTERS: { key: Filter; label: string; test: (m: ContactMessage) => boolean }[] = [
    { key: "inbox",    label: "Inbox",    test: (m) => m.status !== "archived" },
    { key: "unread",   label: "Unread",   test: (m) => m.status === "new" },
    { key: "archived", label: "Archived", test: (m) => m.status === "archived" },
];

const EMPTY: Record<Filter, { title: string; description: string }> = {
    inbox:    { title: "No messages yet",      description: "When someone sends the contact form on your portfolio, their message appears here." },
    unread:   { title: "You're all caught up", description: "Every message has been read." },
    archived: { title: "Nothing archived",     description: "Archive messages you've dealt with to keep your inbox short." },
};

/** Email-style inbox: filters, search, and one row per message (opens the message screen). */
export default function MessagesInbox({ messages }: { messages: ContactMessage[] }) {
    const router = useRouter();

    const [filter, setFilter] = useState<Filter>("inbox");
    const [query,  setQuery]  = useState<string>("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const visible = useMemo(() => {
        const test = FILTERS.find((f) => f.key === filter)!.test;
        return messages.filter((m) => test(m) && matchesMessage(m, query));
    }, [messages, filter, query]);

    const setStatus = async (m: ContactMessage, status: MessageStatus, toast?: string) => {
        setBusyId(m.id);
        if (await updateMessageStatus(m.id, status, { toast })) router.refresh();
        setBusyId(null);
    };

    return (
        <DashboardCard title="Messages" icon={AdminIcons.Mail}>
            <div className={mediaStyles.toolbar}>
                <div className={mediaStyles.filters} role="group" aria-label="Filter messages">
                    {FILTERS.map(({ key, label, test }) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={filter === key}
                            className={filter === key ? mediaStyles.selectedFilter : ""}
                            onClick={() => setFilter(key)}>
                            {label} <span className={mediaStyles.count}>{messages.filter(test).length}</span>
                        </button>
                    ))}
                </div>
                <label className={mediaStyles.search}>
                    <AdminIcons.Search width={16} height={16} />
                    <input type="search" placeholder="Search messages" aria-label="Search messages" value={query} onChange={(e) => setQuery(e.target.value)} />
                </label>
            </div>

            {visible.length === 0 ? (
                query.trim()
                    ? <EmptyState compact icon={AdminIcons.Search} title="No matching messages" description="Try a different search or filter." />
                    : <EmptyState icon={filter === "archived" ? AdminIcons.Archive : AdminIcons.Inbox} title={EMPTY[filter].title} description={EMPTY[filter].description} />
            ) : (
                <ul className={styles.list} aria-label="Messages">
                    {visible.map((m) => {
                        const unread   = m.status === "new";
                        const archived = m.status === "archived";
                        const name     = senderName(m);
                        const busy     = busyId === m.id;

                        return (
                            <li key={m.id} className={`${styles.row} ${unread ? styles.unread : ""}`}>
                                <Link href={`/admin/messages/${m.id}`} className={styles["row-link"]}>
                                    <span className={styles.avatar} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>

                                    <span className={styles.sender}>
                                        {unread && <><span className={styles.dot} aria-hidden="true" /><span className={adminStyles["sr-only"]}>Unread: </span></>}
                                        <span className={styles.name}>{name}</span>
                                    </span>

                                    <span className={styles.summary}>
                                        {m.inquiry_type && <span className={styles.chip}>{m.inquiry_type}</span>}
                                        <span className={styles.subject}>{m.subject}</span>
                                        <span className={styles.snippet}> — {m.message}</span>
                                    </span>

                                    <span className={styles.time}><TimeAgo iso={m.created_at} /></span>
                                </Link>

                                <div className={styles["row-actions"]}>
                                    <button
                                        type="button"
                                        className={styles["row-action"]}
                                        disabled={busy}
                                        aria-label={unread ? `Mark "${m.subject}" as read` : `Mark "${m.subject}" as unread`}
                                        title={unread ? "Mark as read" : "Mark as unread"}
                                        onClick={() => setStatus(m, unread ? "read" : "new")}>
                                        {unread ? <AdminIcons.MailOpen width={16} height={16} /> : <AdminIcons.Mail width={16} height={16} />}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles["row-action"]}
                                        disabled={busy}
                                        aria-label={archived ? `Move "${m.subject}" to inbox` : `Archive "${m.subject}"`}
                                        title={archived ? "Move to inbox" : "Archive"}
                                        onClick={() => setStatus(m, archived ? "read" : "archived", archived ? "Moved to inbox" : undefined)}>
                                        {archived ? <AdminIcons.Inbox width={16} height={16} /> : <AdminIcons.Archive width={16} height={16} />}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </DashboardCard>
    );
}
