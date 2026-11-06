'use client'

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { EXPERIENCE_LABELS, EXPERIENCE_TYPES } from "@/utils/admin/experienceSchema";
import { formatDuration, formatRange, monthsBetween } from "@/utils/experienceTimeline";
import { ExperienceRecord, ExperienceType } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminProjects.module.css";
import expStyles from "@/styles/pages/adminExperience.module.css";

type Filter = "all" | ExperienceType;

const matches = (e: ExperienceRecord, q: string) =>
    !q || [e.company, e.position, e.location, e.employment_type].filter(Boolean).join(" ").toLowerCase().includes(q);

export default function ExperienceManager({ entries }: { entries: ExperienceRecord[] }) {
    const router = useRouter();

    const [query,    setQuery]    = useState<string>("");
    const [filter,   setFilter]   = useState<Filter>("all");
    const [toDelete, setToDelete] = useState<ExperienceRecord | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    // Durations count up to the viewer's current month.
    const today = useMemo(() => new Date(), []);

    const counts = useMemo(() => {
        const c: Record<Filter, number> = { all: entries.length, work: 0, education: 0, milestone: 0 };
        for (const e of entries) c[e.entry_type] += 1;
        return c;
    }, [entries]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return entries.filter((e) => (filter === "all" || e.entry_type === filter) && matches(e, q));
    }, [entries, query, filter]);

    const confirmDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);

        try {
            const res  = await fetch(networkDefine.ADMIN_EXPERIENCE_API(toDelete.id), { method: "DELETE" });
            const json = await res.json().catch(() => null);

            if (!res.ok || !json?.result) {
                sileo.error({ title: "Couldn't delete entry", description: json?.message ?? "Please try again." });
                return;
            }

            sileo.success({ title: "Entry deleted", description: `${toDelete.position} · ${toDelete.company}` });
            setToDelete(null);
            router.refresh();
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
        } finally {
            setDeleting(false);
        }
    };

    if (entries.length === 0) {
        return (
            <div className={adminStyles.card}>
                <EmptyState
                    icon={AdminIcons.Briefcase}
                    title="No entries yet"
                    description={<>
                        Your home page is showing its built-in timeline. Add your first entry, or import the current one by running
                        <code> supabase/migrations/20261109000100_experience_timeline.sql</code> in the Supabase SQL Editor.
                    </>}
                    action={
                        <Link href="/admin/experience/new" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}>
                            <AdminIcons.Plus width={15} height={15} />
                            Add Entry
                        </Link>
                    } />
            </div>
        );
    }

    return (
        <div className={adminStyles.card}>
            <div className={styles.toolbar}>
                <div className={styles.filters} role="group" aria-label="Filter by type">
                    {(["all", ...EXPERIENCE_TYPES] as Filter[]).map((key) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={filter === key}
                            className={filter === key ? styles.selected : ""}
                            onClick={() => setFilter(key)}>
                            {key === "all" ? "All" : EXPERIENCE_LABELS[key].plural} <span className={styles.count}>{counts[key]}</span>
                        </button>
                    ))}
                </div>

                <label className={styles.search}>
                    <AdminIcons.Search width={16} height={16} />
                    <input
                        type="search"
                        placeholder="Search experience"
                        aria-label="Search experience"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)} />
                </label>
            </div>

            {visible.length === 0 ? (
                <EmptyState compact icon={AdminIcons.Search} title="No matching entries" description="Try a different search or filter." />
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th scope="col">Entry</th>
                            <th scope="col">Type</th>
                            <th scope="col">Dates</th>
                            <th scope="col">Duration</th>
                            <th scope="col"><span className={adminStyles["sr-only"]}>Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((entry) => {
                            const isOpen = entry.entry_type !== "milestone" && entry.end_date === null;
                            return (
                                <tr key={entry.id}>
                                    <td>
                                        <div className={styles.project}>
                                            <span className={styles.thumb} aria-hidden="true">
                                                {entry.logo_url
                                                    ? <Image src={entry.logo_url} width={36} height={36} alt="" />
                                                    : <AdminIcons.Briefcase width={16} height={16} />}
                                            </span>
                                            <div className={styles["project-text"]}>
                                                <Link href={`/admin/experience/${entry.id}/edit`} className={styles.title}>
                                                    {entry.position}
                                                </Link>
                                                {isOpen && <span className={styles.featured}>Current</span>}
                                                <p>{entry.company}{entry.employment_type ? ` · ${entry.employment_type}` : ""}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Type">
                                        <span className={`${expStyles.type} ${expStyles[entry.entry_type]}`}>
                                            {EXPERIENCE_LABELS[entry.entry_type].type}
                                        </span>
                                    </td>
                                    <td data-label="Dates" className={styles.muted}>{formatRange(entry)}</td>
                                    <td data-label="Duration" className={styles.muted}>
                                        {entry.entry_type === "milestone" ? "—" : formatDuration(monthsBetween(entry.start_date, entry.end_date, today)).replace(/^For /, "")}
                                    </td>
                                    <td className={styles["actions-cell"]}>
                                        <div className={styles["row-actions"]}>
                                            <Link href={`/admin/experience/${entry.id}/edit`} className={adminStyles["btn-ghost"]} aria-label={`Edit ${entry.position}`}>
                                                <AdminIcons.Pencil width={14} height={14} />
                                                <span className={styles["edit-label"]}>Edit</span>
                                            </Link>
                                            <button
                                                type="button"
                                                className={adminStyles["icon-btn"]}
                                                aria-label={`Delete ${entry.position}`}
                                                onClick={() => setToDelete(entry)}>
                                                <AdminIcons.Close width={16} height={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            <ConfirmDialog
                open={toDelete !== null}
                danger
                title="Delete this entry?"
                description={<><strong>{toDelete?.position}</strong> at {toDelete?.company} will be removed from your timeline. This can&apos;t be undone.</>}
                confirmLabel="Delete entry"
                busy={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)} />
        </div>
    );
}
