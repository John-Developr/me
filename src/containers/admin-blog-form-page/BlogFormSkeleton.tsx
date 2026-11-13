import DashboardCard from "@/components/admin/DashboardCard";
import PageHeader from "@/components/admin/PageHeader";
import Skeleton from "@/components/admin/Skeleton";
import {
    CONTROL_HEIGHT, DangerZoneSkeleton, FieldSkeleton, MetaSkeleton, RadiosSkeleton, SaveBarSkeleton,
} from "@/components/admin/FormSkeletons";
import { ButtonSkeleton } from "@/components/admin/ListSkeletons";
import { AdminIcons } from "@/components/icons/admin";
import { BLOG_LIMITS } from "@/utils/admin/blogSchema";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";

/** MarkdownEditor footprint: toolbar row + rows={18} textarea (18 × 22.4px + 24px padding). */
function MarkdownEditorSkeleton() {
    return (
        <div className={formStyles["md-editor"]}>
            <div className={formStyles["md-toolbar"]}>
                <Skeleton width={280} height={32} radius={8} />
                <Skeleton width={120} height={32} radius={8} />
            </div>
            <Skeleton height={427} radius={0} />
        </div>
    );
}

/**
 * Loading screen for /admin/blog/new and /[id]/edit: the same header, cards,
 * labels and save bar as BlogForm ("Generate with AI" only when creating).
 */
export default function BlogFormSkeleton({ edit = false }: { edit?: boolean }) {
    return (
        <div className={adminStyles.page} aria-busy="true" aria-label="Loading post">
            <PageHeader
                title={edit ? "Edit Post" : "New Post"}
                description={edit
                    ? "Changes go live on your blog as soon as you save a published post."
                    : "Write your own post, or let the AI draft one. Start as a draft, or publish right away."} />

            <div className={formStyles.form}>
                <div className={formStyles["form-main"]}>
                    {!edit && (
                        <DashboardCard
                            title="Generate with AI"
                            icon={AdminIcons.Zap}
                            subtitle="Gemini writes a post in the category you pick. Nothing is saved until you do.">
                            <FieldSkeleton
                                label="Category"
                                hint="Generating takes up to a minute."
                                control={
                                    <div className={formStyles["inline-action"]}>
                                        <Skeleton height={CONTROL_HEIGHT.input} radius={8} />
                                        <ButtonSkeleton width={150} />
                                    </div>
                                } />
                        </DashboardCard>
                    )}

                    <DashboardCard title="Basics" icon={AdminIcons.FileText}>
                        <div className={formStyles.fields}>
                            <FieldSkeleton label="Title" required />
                            <div className={`${formStyles.fields} ${formStyles.two}`}>
                                <FieldSkeleton label="Slug" required hint="The post's URL: /blog/your-slug" />
                                <FieldSkeleton label="Category" required />
                            </div>
                            <FieldSkeleton label="Excerpt" required hint="Plain text shown on blog cards and in search results." height={CONTROL_HEIGHT.textarea3} />
                            <FieldSkeleton label="Tags" hint={`Press Enter or comma to add. Up to ${BLOG_LIMITS.tags}.`} />
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Content" icon={AdminIcons.Pencil} subtitle="Use the toolbar or type Markdown.">
                        <div className={formStyles.fields}>
                            <FieldSkeleton
                                label="Post"
                                required
                                hint="Start with the hook paragraph; the title is shown above it."
                                control={<MarkdownEditorSkeleton />} />
                        </div>
                    </DashboardCard>
                </div>

                <aside className={formStyles["form-side"]}>
                    <DashboardCard title="Publishing" icon={AdminIcons.Globe}>
                        <RadiosSkeleton options={[
                            { title: "Draft",     text: "Only visible here" },
                            { title: "Published", text: "Shown on your blog" },
                        ]} />
                        <MetaSkeleton labels={edit ? ["Written by", "Created", "Last saved", "Views"] : ["Written by"]} />
                    </DashboardCard>

                    {edit && (
                        <DashboardCard title="Danger zone" icon={AdminIcons.AlertCircle}>
                            <DangerZoneSkeleton hint="Deleting is permanent. To hide a post, set it to Draft instead." label="Delete post" />
                        </DashboardCard>
                    )}
                </aside>

                <SaveBarSkeleton edit={edit} />
            </div>
        </div>
    );
}
