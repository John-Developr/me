'use client'

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { useProjectMutations } from "@/hooks/useProjectMutations";
import { ProjectRecord, ProjectStatus } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminProjects.module.css";

import ProjectRowActions from "./ProjectRowActions";

type StatusFilter = "all" | ProjectStatus;

const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "published", label: "Published" },
    { key: "draft",     label: "Drafts" },
];

/** Case-insensitive match on title, slug, tagline, organization and tech. */
const matches = (project: ProjectRecord, query: string): boolean => {
    if (!query) return true;
    const haystack = [project.title, project.slug, project.tagline, project.organization, ...project.tech]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return haystack.includes(query);
};

export default function ProjectsManager({ projects }: { projects: ProjectRecord[] }) {
    const { patch, remove, pendingId } = useProjectMutations();

    const [query,    setQuery]    = useState<string>("");
    const [filter,   setFilter]   = useState<StatusFilter>("all");
    const [toDelete, setToDelete] = useState<ProjectRecord | null>(null);

    const counts = useMemo(() => ({
        all:       projects.length,
        published: projects.filter((p) => p.status === "published").length,
        draft:     projects.filter((p) => p.status === "draft").length,
    }), [projects]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return projects.filter((p) => (filter === "all" || p.status === filter) && matches(p, q));
    }, [projects, query, filter]);

    const confirmDelete = async () => {
        if (!toDelete) return;
        const ok = await remove(toDelete);
        if (ok) setToDelete(null);
    };

    if (projects.length === 0) {
        return (
            <div className={adminStyles.card}>
                <EmptyState
                    icon={AdminIcons.Folder}
                    title="No projects yet"
                    description={<>
                        Create your first project, or import the four projects your site already shows by running
                        <code> supabase/migrations/20261107000200_seed_projects.sql</code> in the Supabase SQL Editor.
                    </>}
                    action={
                        <Link href="/admin/projects/new" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}>
                            <AdminIcons.Plus width={15} height={15} />
                            Create Project
                        </Link>
                    } />
            </div>
        );
    }

    return (
        <DashboardCard title="Projects" icon={AdminIcons.Folder}>
            <div className={styles.toolbar}>
                <div className={styles.filters} role="group" aria-label="Filter by status">
                    {FILTERS.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={filter === key}
                            className={filter === key ? styles.selected : ""}
                            onClick={() => setFilter(key)}>
                            {label} <span className={styles.count}>{counts[key]}</span>
                        </button>
                    ))}
                </div>

                <label className={styles.search}>
                    <AdminIcons.Search width={16} height={16} />
                    <input
                        type="search"
                        placeholder="Search projects"
                        aria-label="Search projects"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)} />
                </label>
            </div>

            {visible.length === 0 ? (
                <EmptyState
                    compact
                    icon={AdminIcons.Search}
                    title="No matching projects"
                    description="Try a different search or status filter." />
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th scope="col">Project</th>
                            <th scope="col">Status</th>
                            <th scope="col" className={styles.num}>Order</th>
                            <th scope="col">Updated</th>
                            <th scope="col"><span className={adminStyles["sr-only"]}>Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((project) => (
                            <tr key={project.id} className={pendingId === project.id ? styles.pending : ""} aria-busy={pendingId === project.id}>
                                <td>
                                    <div className={styles.project}>
                                        <span className={styles.thumb} aria-hidden="true">
                                            {project.logo_url
                                                ? <Image src={project.logo_url} width={36} height={36} alt="" />
                                                : <AdminIcons.Folder width={16} height={16} />}
                                        </span>
                                        <div className={styles["project-text"]}>
                                            <Link href={`/admin/projects/${project.id}/edit`} className={styles.title}>
                                                {project.title}
                                            </Link>
                                            {project.is_featured && (
                                                <span className={styles.featured}>Featured</span>
                                            )}
                                            <p>{project.tagline || <span className={styles.muted}>/{project.slug}</span>}</p>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Status">
                                    <span className={`${styles.status} ${styles[project.status]}`}>
                                        {project.status === "published" ? "Published" : "Draft"}
                                    </span>
                                </td>
                                <td data-label="Order" className={styles.num}>{project.sort_order}</td>
                                <td data-label="Updated" className={styles.muted}><TimeAgo iso={project.updated_at} /></td>
                                <td className={styles["actions-cell"]}>
                                    <ProjectRowActions
                                        project={project}
                                        busy={pendingId === project.id}
                                        onPatch={patch}
                                        onDelete={setToDelete} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <ConfirmDialog
                open={toDelete !== null}
                danger
                title="Delete this project?"
                description={<>
                    <strong>{toDelete?.title}</strong> will be removed from the admin
                    {toDelete?.status === "published" ? " and from your public Projects page" : ""}. This can&apos;t be undone.
                    If you only want to hide it, unpublish it instead.
                </>}
                confirmLabel="Delete project"
                busy={pendingId !== null && pendingId === toDelete?.id}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)} />
        </DashboardCard>
    );
}
