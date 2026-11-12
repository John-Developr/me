'use client'

import { useCallback, useRef, useState } from "react";
import Link from "next/link";

import { AdminIcons } from "@/components/icons/admin";
import { useDismiss } from "@/hooks/useDismiss";
import { BASE_URL } from "@/config/siteUrl";
import { BlogPatch } from "@/utils/admin/blogSchema";
import { BlogRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminProjects.module.css";

interface BlogRowActionsProps {
    post:     BlogRecord;
    busy:     boolean;
    onPatch:  (post: BlogRecord, changes: BlogPatch, successTitle: string) => Promise<boolean>;
    onDelete: (post: BlogRecord) => void;
}

/** Edit button + "more" menu (publish, view, delete) for one post row. */
export default function BlogRowActions({ post, busy, onPatch, onDelete }: BlogRowActionsProps) {
    const [open, setOpen] = useState<boolean>(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    const run = (action: () => void) => () => { close(); action(); };
    const isPublished = post.status === "published";

    return (
        <div ref={rootRef} className={`${adminStyles.popover} ${styles["row-actions"]}`}>
            <Link href={`/admin/blog/${post.id}/edit`} className={adminStyles["btn-ghost"]} aria-label={`Edit ${post.title}`}>
                <AdminIcons.Pencil width={14} height={14} />
                <span className={styles["edit-label"]}>Edit</span>
            </Link>

            <button
                type="button"
                className={adminStyles["icon-btn"]}
                aria-label={`More actions for ${post.title}`}
                aria-haspopup="menu"
                aria-expanded={open}
                disabled={busy}
                onClick={() => setOpen((v) => !v)}>
                {busy ? <AdminIcons.Refresh width={16} height={16} className={adminStyles.spin} /> : <AdminIcons.ChevronDown width={16} height={16} />}
            </button>

            {open && (
                <div className={`${adminStyles["popover-panel"]} ${styles["row-menu"]}`} role="menu">
                    <button
                        type="button"
                        role="menuitem"
                        className={adminStyles["menu-item"]}
                        onClick={run(() => onPatch(
                            post,
                            { status: isPublished ? "draft" : "published" },
                            isPublished ? "Moved to drafts" : "Post published",
                        ))}>
                        {isPublished ? <AdminIcons.FileText width={16} height={16} /> : <AdminIcons.Globe width={16} height={16} />}
                        {isPublished ? "Unpublish (move to drafts)" : "Publish"}
                    </button>

                    {isPublished && (
                        <a
                            role="menuitem"
                            className={adminStyles["menu-item"]}
                            href={`${BASE_URL}/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={close}>
                            <AdminIcons.ExternalLink width={16} height={16} />
                            View on site
                        </a>
                    )}

                    <button
                        type="button"
                        role="menuitem"
                        className={`${adminStyles["menu-item"]} ${adminStyles.danger}`}
                        onClick={run(() => onDelete(post))}>
                        <AdminIcons.Trash width={16} height={16} />
                        Delete…
                    </button>
                </div>
            )}
        </div>
    );
}
