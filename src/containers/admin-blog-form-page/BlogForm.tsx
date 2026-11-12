'use client'

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DashboardCard from "@/components/admin/DashboardCard";
import FormField from "@/components/admin/FormField";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import TagInput from "@/components/admin/TagInput";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { BASE_URL } from "@/config/siteUrl";
import { useBlogMutations } from "@/hooks/useBlogMutations";
import {
    BLOG_CATEGORIES,
    BLOG_CATEGORY_LABELS,
    BLOG_LIMITS,
    BlogCategory,
    blogInputSchema,
} from "@/utils/admin/blogSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";
import { sendJson } from "@/utils/admin/sendJson";
import { getReadingTime, slugify } from "@/utils/general/stringHelpers";
import { BlogRecord, BlogSource, BlogStatus, GeneratedBlogPost } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";

// ─── Form state ─────────────────────────────────────────────

interface FormState {
    title: string; slug: string; category: BlogCategory | ""; excerpt: string;
    content: string; tags: string[]; status: BlogStatus; source: BlogSource;
}

type FieldKey = keyof FormState;

const fromRecord = (p?: BlogRecord): FormState => ({
    title:    p?.title    ?? "",
    slug:     p?.slug     ?? "",
    category: p?.category ?? "",
    excerpt:  p?.excerpt  ?? "",
    content:  p?.content  ?? "",
    tags:     p?.tags     ?? [],
    status:   p?.status   ?? "draft",
    source:   p?.source   ?? "personal",
});

// ─── Form ───────────────────────────────────────────────────

interface BlogFormProps {
    /** Existing post (edit) or undefined (create). */
    post?: BlogRecord;
}

export default function BlogForm({ post }: BlogFormProps) {
    const router = useRouter();
    const isEdit = !!post;
    const { remove, pendingId } = useBlogMutations();

    const initial = useMemo(() => fromRecord(post), [post]);

    const [values,      setValues]      = useState<FormState>(initial);
    const [baseline,    setBaseline]    = useState<FormState>(initial);
    const [errors,      setErrors]      = useState<Record<string, string>>({});
    const [saving,      setSaving]      = useState<boolean>(false);
    const [slugTouched, setSlugTouched] = useState<boolean>(isEdit);
    const [confirm,     setConfirm]     = useState<"discard" | "delete" | "replace" | null>(null);
    const [genCategory, setGenCategory] = useState<BlogCategory>("technology");
    const [generating,  setGenerating]  = useState<boolean>(false);

    const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);

    // Warn before closing/reloading the tab with unsaved edits.
    useEffect(() => {
        if (!isDirty) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [isDirty]);

    const set = <K extends FieldKey>(key: K, value: FormState[K]) => {
        setValues((prev) => {
            const next = { ...prev, [key]: value };
            // New posts: the slug follows the title until edited by hand.
            if (key === "title" && !slugTouched) next.slug = slugify(String(value), 80);
            return next;
        });
        if (errors[key]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const text = (key: FieldKey) => ({
        id:                 `field-${key}`,
        name:               key,
        value:              values[key] as string,
        "aria-invalid":     !!errors[key] || undefined,
        "aria-describedby": errors[key] ? `field-${key}-error` : undefined,
        onChange:           (e: { target: { value: string } }) => set(key, e.target.value as never),
    });

    const focusFirstError = (fieldErrors: Record<string, string>) => {
        const first = Object.keys(fieldErrors)[0];
        if (first) document.getElementById(`field-${first}`)?.focus();
    };

    // ─── AI generation ──────────────────────────────────────

    const hasText = !!(values.title.trim() || values.excerpt.trim() || values.content.trim());

    const generate = async () => {
        setConfirm(null);
        setGenerating(true);

        const res = await sendJson<GeneratedBlogPost>(networkDefine.ADMIN_BLOG_GENERATE_API, "POST", { category: genCategory });
        setGenerating(false);

        if (!res.result || !res.data) {
            sileo.error({ title: "Couldn't generate a post", description: res.message });
            return;
        }

        const ai = res.data;
        setValues((prev) => ({
            ...prev,
            title:    ai.title,
            slug:     ai.slug,
            category: ai.category as BlogCategory,
            excerpt:  ai.excerpt,
            content:  ai.content,
            tags:     ai.tags.slice(0, BLOG_LIMITS.tags),
            source:   "ai",
        }));
        setSlugTouched(true);
        setErrors({});
        sileo.success({ title: "Draft ready", description: "Review it, then save as a draft or publish." });
    };

    // ─── Save / delete ──────────────────────────────────────

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving || generating) return;

        const parsed = blogInputSchema.safeParse(values);
        if (!parsed.success) {
            const fieldErrors = toFieldErrors(parsed.error);
            setErrors(fieldErrors);
            focusFirstError(fieldErrors);
            return;
        }

        setSaving(true);
        const res = await sendJson<BlogRecord>(
            isEdit ? networkDefine.ADMIN_BLOG_API(post.id) : networkDefine.ADMIN_BLOGS_API,
            isEdit ? "PATCH" : "POST",
            values,
        );
        setSaving(false);

        if (!res.result || !res.data) {
            if (res.errors) {
                setErrors(res.errors);
                focusFirstError(res.errors);
            }
            sileo.error({ title: "Couldn't save post", description: res.message });
            return;
        }

        sileo.success({ title: isEdit ? "Post saved" : "Post created", description: res.data.title });

        if (isEdit) {
            const saved = fromRecord(res.data);
            setValues(saved);
            setBaseline(saved);
            router.refresh();
        } else {
            setBaseline(values); // allow navigation without the unsaved-changes prompt
            router.push("/admin/blog");
            router.refresh();
        }
    };

    const handleCancel = () => {
        if (isDirty) setConfirm("discard");
        else router.push("/admin/blog");
    };

    const handleDelete = async () => {
        if (!post) return;
        if (await remove(post)) {
            setBaseline(values);
            router.push("/admin/blog");
        }
    };

    const busy = saving || generating;

    return (
        <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
            <div className={formStyles["form-main"]}>
                {!isEdit && (
                    <DashboardCard
                        title="Generate with AI"
                        icon={AdminIcons.Zap}
                        subtitle="Gemini writes a post in the category you pick. Nothing is saved until you do.">
                        <FormField id="gen_category" label="Category" hint="Generating takes up to a minute.">
                            <div className={formStyles["inline-action"]}>
                                <select
                                    id="field-gen_category"
                                    value={genCategory}
                                    disabled={busy}
                                    onChange={(e) => setGenCategory(e.target.value as BlogCategory)}>
                                    {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{BLOG_CATEGORY_LABELS[c]}</option>)}
                                </select>
                                <button
                                    type="button"
                                    className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}
                                    disabled={busy}
                                    aria-busy={generating}
                                    onClick={() => (hasText ? setConfirm("replace") : generate())}>
                                    {generating
                                        ? <AdminIcons.Refresh width={15} height={15} className={adminStyles.spin} />
                                        : <AdminIcons.Zap width={15} height={15} />}
                                    {generating ? "Writing…" : "Generate post"}
                                </button>
                            </div>
                        </FormField>
                    </DashboardCard>
                )}

                <DashboardCard title="Basics" icon={AdminIcons.FileText}>
                    <div className={formStyles.fields}>
                        <FormField id="title" label="Title" required error={errors.title}>
                            <input {...text("title")} maxLength={BLOG_LIMITS.title} />
                        </FormField>

                        <div className={`${formStyles.fields} ${formStyles.two}`}>
                            <FormField
                                id="slug"
                                label="Slug"
                                required
                                error={errors.slug}
                                hint="The post's URL: /blog/your-slug">
                                <input
                                    {...text("slug")}
                                    maxLength={BLOG_LIMITS.slug}
                                    spellCheck={false}
                                    onChange={(e) => { setSlugTouched(true); set("slug", e.target.value.toLowerCase()); }} />
                            </FormField>

                            <FormField id="category" label="Category" required error={errors.category}>
                                <select {...text("category")}>
                                    <option value="" disabled>Choose…</option>
                                    {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{BLOG_CATEGORY_LABELS[c]}</option>)}
                                </select>
                            </FormField>
                        </div>

                        <FormField
                            id="excerpt"
                            label="Excerpt"
                            required
                            error={errors.excerpt}
                            hint="Plain text shown on blog cards and in search results."
                            count={{ value: values.excerpt.trim().length, max: BLOG_LIMITS.excerpt }}>
                            <textarea {...text("excerpt")} rows={3} />
                        </FormField>

                        <FormField
                            id="tags"
                            label="Tags"
                            error={errors.tags}
                            hint={`Press Enter or comma to add. Up to ${BLOG_LIMITS.tags}.`}>
                            <TagInput
                                id="field-tags"
                                items={values.tags}
                                max={BLOG_LIMITS.tags}
                                maxLength={BLOG_LIMITS.tag}
                                onChange={(items) => set("tags", items)} />
                        </FormField>
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="Content"
                    icon={AdminIcons.Pencil}
                    subtitle={`Use the toolbar or type Markdown. About ${getReadingTime(values.content)} min read.`}>
                    <div className={formStyles.fields}>
                        <FormField
                            id="content"
                            label="Post"
                            required
                            error={errors.content}
                            hint="Start with the hook paragraph; the title is shown above it."
                            count={{ value: values.content.trim().length, max: BLOG_LIMITS.content }}>
                            <MarkdownEditor
                                {...text("content")}
                                onChange={(value) => set("content", value)}
                                rows={18}
                                spellCheck
                                disabled={generating} />
                        </FormField>
                    </div>
                </DashboardCard>
            </div>

            <aside className={formStyles["form-side"]}>
                <DashboardCard title="Publishing" icon={AdminIcons.Globe}>
                    <fieldset className={formStyles.radios}>
                        <legend className={adminStyles["sr-only"]}>Status</legend>
                        {(["draft", "published"] as const).map((status) => (
                            <label key={status} className={values.status === status ? formStyles.checked : ""}>
                                <input
                                    type="radio"
                                    name="status"
                                    value={status}
                                    checked={values.status === status}
                                    onChange={() => set("status", status)} />
                                <span>
                                    <strong>{status === "draft" ? "Draft" : "Published"}</strong>
                                    <small>{status === "draft" ? "Only visible here" : "Shown on your blog"}</small>
                                </span>
                            </label>
                        ))}
                    </fieldset>

                    <dl className={formStyles.meta}>
                        <div><dt>Written by</dt><dd>{values.source === "ai" ? "AI (Gemini)" : "You"}</dd></div>
                        {post && <>
                            <div><dt>{post.status === "published" ? "Published" : "Created"}</dt><dd><TimeAgo iso={post.generated_at} /></dd></div>
                            <div><dt>Last saved</dt><dd><TimeAgo iso={post.updated_at} /></dd></div>
                            <div><dt>Views</dt><dd>{post.views ?? 0}</dd></div>
                        </>}
                    </dl>

                    {post?.status === "published" && (
                        <a
                            className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                            href={`${BASE_URL}/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            <AdminIcons.ExternalLink width={15} height={15} />
                            View on site
                        </a>
                    )}
                </DashboardCard>

                {post && (
                    <DashboardCard title="Danger zone" icon={AdminIcons.AlertCircle}>
                        <p className={formStyles["field-hint"]}>Deleting is permanent. To hide a post, set it to Draft instead.</p>
                        <button type="button" className={`liquid_glass_btn ${adminStyles["btn-danger"]}`} onClick={() => setConfirm("delete")}>
                            Delete post
                        </button>
                    </DashboardCard>
                )}
            </aside>

            <div className={formStyles["save-bar"]}>
                <p className={formStyles["save-status"]} aria-live="polite">
                    {isDirty ? "Unsaved changes" : isEdit ? "All changes saved" : ""}
                </p>
                <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={handleCancel} disabled={saving}>
                    {isEdit ? "Back" : "Cancel"}
                </button>
                <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={busy || (isEdit && !isDirty)}>
                    <AdminIcons.Check width={15} height={15} />
                    {saving ? "Saving…" : isEdit ? "Save changes" : values.status === "published" ? "Create & publish" : "Create draft"}
                </button>
            </div>

            <ConfirmDialog
                open={confirm === "replace"}
                title="Replace what you've written?"
                description="The generated post will overwrite the title, slug, category, excerpt, tags and content."
                confirmLabel="Generate anyway"
                onConfirm={generate}
                onCancel={() => setConfirm(null)} />

            <ConfirmDialog
                open={confirm === "discard"}
                title="Discard unsaved changes?"
                description="Your edits to this post haven't been saved."
                confirmLabel="Discard changes"
                danger
                onConfirm={() => { setBaseline(values); setConfirm(null); router.push("/admin/blog"); }}
                onCancel={() => setConfirm(null)} />

            <ConfirmDialog
                open={confirm === "delete"}
                title="Delete this post?"
                description={<><strong>{post?.title}</strong> will be removed permanently. This can&apos;t be undone.</>}
                confirmLabel="Delete post"
                danger
                busy={pendingId !== null}
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)} />
        </form>
    );
}
