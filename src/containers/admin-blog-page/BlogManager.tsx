'use client'

import { useMemo, useState } from "react";
import Link from "next/link";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { useBlogMutations } from "@/hooks/useBlogMutations";
import { BLOG_CATEGORY_LABELS } from "@/utils/admin/blogSchema";
import { BlogRecord, BlogStatus } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminProjects.module.css";

import BlogRowActions from "./BlogRowActions";

type StatusFilter = "all" | BlogStatus;

const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "published", label: "Published" },
    { key: "draft",     label: "Drafts" },
];

/** Case-insensitive match on title, slug, category and tags. */
const matches = (post: BlogRecord, query: string): boolean => {
    if (!query) return true;
    return [post.title, post.slug, post.category, ...post.tags].join(" ").toLowerCase().includes(query);
};

export default function BlogManager({ posts }: { posts: BlogRecord[] }) {
    const { patch, remove, pendingId } = useBlogMutations();

    const [query,    setQuery]    = useState<string>("");
    const [filter,   setFilter]   = useState<StatusFilter>("all");
    const [toDelete, setToDelete] = useState<BlogRecord | null>(null);

    const counts = useMemo(() => ({
        all:       posts.length,
        published: posts.filter((p) => p.status === "published").length,
        draft:     posts.filter((p) => p.status === "draft").length,
    }), [posts]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return posts.filter((p) => (filter === "all" || p.status === filter) && matches(p, q));
    }, [posts, query, filter]);

    const confirmDelete = async () => {
        if (!toDelete) return;
        if (await remove(toDelete)) setToDelete(null);
    };

    if (posts.length === 0) {
        return (
            <div className={adminStyles.card}>
                <EmptyState
                    icon={AdminIcons.FileText}
                    title="No blog posts yet"
                    description="Write your first post, or let the AI draft one in the category you pick."
                    action={
                        <Link href="/admin/blog/new" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}>
                            <AdminIcons.Plus width={15} height={15} />
                            New Post
                        </Link>
                    } />
            </div>
        );
    }

    return (
        <DashboardCard title="Posts" icon={AdminIcons.FileText}>
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
                        placeholder="Search posts"
                        aria-label="Search posts"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)} />
                </label>
            </div>

            {visible.length === 0 ? (
                <EmptyState
                    compact
                    icon={AdminIcons.Search}
                    title="No matching posts"
                    description="Try a different search or status filter." />
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th scope="col">Post</th>
                            <th scope="col">Status</th>
                            <th scope="col">Category</th>
                            <th scope="col" className={styles.num}>Views</th>
                            <th scope="col">Date</th>
                            <th scope="col"><span className={adminStyles["sr-only"]}>Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((post) => (
                            <tr key={post.id} className={pendingId === post.id ? styles.pending : ""} aria-busy={pendingId === post.id}>
                                <td>
                                    <div className={styles.project}>
                                        <span className={styles.thumb} aria-hidden="true">
                                            {post.source === "ai"
                                                ? <AdminIcons.Zap width={16} height={16} />
                                                : <AdminIcons.Pencil width={16} height={16} />}
                                        </span>
                                        <div className={styles["project-text"]}>
                                            <Link href={`/admin/blog/${post.id}/edit`} className={styles.title}>
                                                {post.title}
                                            </Link>
                                            <span className={styles.featured}>{post.source === "ai" ? "AI" : "Personal"}</span>
                                            <p>{post.excerpt}</p>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Status">
                                    <span className={`${styles.status} ${styles[post.status]}`}>
                                        {post.status === "published" ? "Published" : "Draft"}
                                    </span>
                                </td>
                                <td data-label="Category">{BLOG_CATEGORY_LABELS[post.category] ?? post.category}</td>
                                <td data-label="Views" className={styles.num}>{post.views ?? 0}</td>
                                <td data-label="Date" className={styles.muted}><TimeAgo iso={post.generated_at} /></td>
                                <td className={styles["actions-cell"]}>
                                    <BlogRowActions
                                        post={post}
                                        busy={pendingId === post.id}
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
                title="Delete this post?"
                description={<>
                    <strong>{toDelete?.title}</strong> will be removed from the admin
                    {toDelete?.status === "published" ? " and from your public blog" : ""}. This can&apos;t be undone.
                    If you only want to hide it, unpublish it instead.
                </>}
                confirmLabel="Delete post"
                busy={pendingId !== null && pendingId === toDelete?.id}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)} />
        </DashboardCard>
    );
}
