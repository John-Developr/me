import Link from "next/link";

import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import { AdminIcons } from "@/components/icons/admin";
import AdminAuthService from "@/lib/.services/adminAuthService";
import AdminBlogService from "@/lib/.services/adminBlogService";
import { BlogRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import BlogManager from "./BlogManager";

/** Loads every post (drafts included) under the admin's RLS session. */
async function loadPosts(): Promise<{ ok: true; data: BlogRecord[] } | { ok: false }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false };
        return { ok: true, data: await new AdminBlogService(session.client).list() };
    } catch {
        return { ok: false };
    }
}

export default async function AdminBlogPage() {
    const posts = await loadPosts();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title="Blog"
                    description="AI-generated and personal posts. Only published posts appear on your blog."
                    actions={
                        <Link href="/admin/blog/new" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}>
                            <AdminIcons.Plus width={15} height={15} />
                            New Post
                        </Link>
                    } />

                {posts.ok
                    ? <BlogManager posts={posts.data} />
                    : <ErrorState message="Couldn't load your blog posts. Check your connection and try again." />}
            </div>
        </DashboardRefreshProvider>
    );
}
