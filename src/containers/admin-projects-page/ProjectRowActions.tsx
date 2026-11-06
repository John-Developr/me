'use client'

import { useCallback, useRef, useState } from "react";
import Link from "next/link";

import { AdminIcons } from "@/components/icons/admin";
import { useDismiss } from "@/hooks/useDismiss";
import { BASE_URL } from "@/config/siteUrl";
import { ProjectPatch } from "@/utils/admin/projectSchema";
import { ProjectRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminProjects.module.css";

interface ProjectRowActionsProps {
    project:  ProjectRecord;
    busy:     boolean;
    onPatch:  (project: ProjectRecord, changes: ProjectPatch, successTitle: string) => Promise<boolean>;
    onDelete: (project: ProjectRecord) => void;
}

/** Edit button + "more" menu (publish, feature, view, delete) for one row. */
export default function ProjectRowActions({ project, busy, onPatch, onDelete }: ProjectRowActionsProps) {
    const [open, setOpen] = useState<boolean>(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    const run = (action: () => void) => () => { close(); action(); };
    const isPublished = project.status === "published";

    return (
        <div ref={rootRef} className={`${adminStyles.popover} ${styles["row-actions"]}`}>
            <Link href={`/admin/projects/${project.id}/edit`} className={adminStyles["btn-ghost"]} aria-label={`Edit ${project.title}`}>
                <AdminIcons.Pencil width={14} height={14} />
                <span className={styles["edit-label"]}>Edit</span>
            </Link>

            <button
                type="button"
                className={adminStyles["icon-btn"]}
                aria-label={`More actions for ${project.title}`}
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
                            project,
                            { status: isPublished ? "draft" : "published" },
                            isPublished ? "Moved to drafts" : "Project published",
                        ))}>
                        {isPublished ? <AdminIcons.FileText width={16} height={16} /> : <AdminIcons.Globe width={16} height={16} />}
                        {isPublished ? "Unpublish (move to drafts)" : "Publish"}
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        className={adminStyles["menu-item"]}
                        onClick={run(() => onPatch(
                            project,
                            { is_featured: !project.is_featured },
                            project.is_featured ? "Removed from featured" : "Now featured",
                        ))}>
                        <AdminIcons.Award width={16} height={16} />
                        {project.is_featured ? "Remove from featured" : "Make featured"}
                    </button>

                    {isPublished && (
                        <a
                            role="menuitem"
                            className={adminStyles["menu-item"]}
                            href={`${BASE_URL}/projects`}
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
                        onClick={run(() => onDelete(project))}>
                        <AdminIcons.Close width={16} height={16} />
                        Delete…
                    </button>
                </div>
            )}
        </div>
    );
}
