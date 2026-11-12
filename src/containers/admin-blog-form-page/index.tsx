import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import AdminBlogService from "@/lib/.services/adminBlogService";
import { BlogRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import BlogForm from "./BlogForm";

interface AdminBlogFormPageProps {
    /** Post id to edit; omitted when creating. */
    id?: string;
}

export default async function AdminBlogFormPage({ id }: AdminBlogFormPageProps) {
    const postId = id === undefined ? undefined : Number(id);
    if (postId !== undefined && !(Number.isInteger(postId) && postId > 0)) notFound();

    let post:    BlogRecord | undefined;
    let failed  = false;
    let missing = false;

    if (postId !== undefined) {
        try {
            const session = await AdminAuthService.getSession();
            if (session.status !== "admin") throw new Error("Not authorized.");
            post    = (await new AdminBlogService(session.client).getById(postId)) ?? undefined;
            missing = !post;
        } catch {
            failed = true;
        }
    }

    if (missing) notFound();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title={post ? `Edit “${post.title}”` : "New Post"}
                    description={post
                        ? "Changes go live on your blog as soon as you save a published post."
                        : "Write your own post, or let the AI draft one. Start as a draft, or publish right away."} />

                {failed
                    ? <ErrorState message="Couldn't load this post. Check your connection and try again." />
                    : <BlogForm key={post?.id ?? "new"} post={post} />}
            </div>
        </DashboardRefreshProvider>
    );
}
