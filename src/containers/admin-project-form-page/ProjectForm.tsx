'use client'

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DashboardCard from "@/components/admin/DashboardCard";
import FormField from "@/components/admin/FormField";
import Select from "@/components/admin/Select";
import AssetInput from "@/components/admin/AssetInput";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { ProjectApiResponse, useProjectMutations } from "@/hooks/useProjectMutations";
import { PROJECT_KINDS, PROJECT_LIMITS, projectInputSchema } from "@/utils/admin/projectSchema";
import { toFieldErrors } from "@/utils/admin/formErrors";
import { slugify } from "@/utils/general/stringHelpers";
import { ProjectRecord, ProjectStatus } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";

import HighlightsInput from "./HighlightsInput";
import TagInput from "@/components/admin/TagInput";

// ─── Form state ──────────────────────────────────────────────

interface FormState {
    title: string; slug: string; tagline: string; description: string;
    kind: string; role: string; organization: string; period: string;
    highlights: string[]; tech: string[];
    logo_url: string; image_url: string;
    live_url: string; live_label: string; source_url: string; source_label: string; note: string;
    status: ProjectStatus; is_featured: boolean; sort_order: string;
}

type FieldKey = keyof FormState;

const fromRecord = (p?: ProjectRecord, nextOrder = 0): FormState => ({
    title:        p?.title        ?? "",
    slug:         p?.slug         ?? "",
    tagline:      p?.tagline      ?? "",
    description:  p?.description  ?? "",
    kind:         p?.kind         ?? "",
    role:         p?.role         ?? "",
    organization: p?.organization ?? "",
    period:       p?.period       ?? "",
    highlights:   p?.highlights   ?? [],
    tech:         p?.tech         ?? [],
    logo_url:     p?.logo_url     ?? "",
    image_url:    p?.image_url    ?? "",
    live_url:     p?.live_url     ?? "",
    live_label:   p?.live_label   ?? "",
    source_url:   p?.source_url   ?? "",
    source_label: p?.source_label ?? "",
    note:         p?.note         ?? "",
    status:       p?.status       ?? "draft",
    is_featured:  p?.is_featured  ?? false,
    sort_order:   String(p?.sort_order ?? nextOrder),
});

/** Form state → API body (the schema trims, nulls empties and validates). */
const toPayload = (s: FormState) => ({
    ...s,
    kind:       s.kind || null,
    highlights: s.highlights.map((h) => h.trim()).filter(Boolean),
    sort_order: s.sort_order.trim() === "" ? 0 : Number(s.sort_order),
});

// ─── Form ────────────────────────────────────────────────────

interface ProjectFormProps {
    /** Existing project (edit) or undefined (create). */
    project?:  ProjectRecord;
    /** Default display order for a new project (end of the list). */
    nextOrder?: number;
}

export default function ProjectForm({ project, nextOrder = 0 }: ProjectFormProps) {
    const router   = useRouter();
    const isEdit   = !!project;
    const { remove, pendingId } = useProjectMutations();

    const initial = useMemo(() => fromRecord(project, nextOrder), [project, nextOrder]);

    const [values,      setValues]      = useState<FormState>(initial);
    const [baseline,    setBaseline]    = useState<FormState>(initial);
    const [errors,      setErrors]      = useState<Record<string, string>>({});
    const [saving,      setSaving]      = useState<boolean>(false);
    const [slugTouched, setSlugTouched] = useState<boolean>(isEdit);
    const [confirm,     setConfirm]     = useState<"discard" | "delete" | null>(null);

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
            // New projects: the slug follows the title until edited by hand.
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving) return;

        const parsed = projectInputSchema.safeParse(toPayload(values));
        if (!parsed.success) {
            const fieldErrors = toFieldErrors(parsed.error);
            setErrors(fieldErrors);
            focusFirstError(fieldErrors);
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(
                isEdit ? networkDefine.ADMIN_PROJECT_API(project.id) : networkDefine.ADMIN_PROJECTS_API,
                {
                    method:  isEdit ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(toPayload(values)),
                },
            );
            const json = (await res.json().catch(() => null)) as ProjectApiResponse | null;

            if (!res.ok || !json?.result || !json.data) {
                if (json?.errors) {
                    setErrors(json.errors);
                    focusFirstError(json.errors);
                }
                sileo.error({ title: "Couldn't save project", description: json?.message ?? "Please try again." });
                return;
            }

            sileo.success({ title: isEdit ? "Project saved" : "Project created", description: json.data.title });

            if (isEdit) {
                const saved = fromRecord(json.data);
                setValues(saved);
                setBaseline(saved);
                router.refresh();
            } else {
                setBaseline(values); // allow navigation without the unsaved-changes prompt
                router.push("/admin/projects");
                router.refresh();
            }
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (isDirty) setConfirm("discard");
        else router.push("/admin/projects");
    };

    const handleDelete = async () => {
        if (!project) return;
        if (await remove(project)) {
            setBaseline(values);
            router.push("/admin/projects");
        }
    };

    const descriptionLength = values.description.trim().length;

    return (
        <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
            <div className={formStyles["form-main"]}>
                <DashboardCard title="Basics" icon={AdminIcons.FileText}>
                    <div className={formStyles.fields}>
                        <FormField id="title" label="Title" required error={errors.title}>
                            <input {...text("title")} maxLength={160} autoFocus={!isEdit} />
                        </FormField>

                        <FormField
                            id="slug"
                            label="Slug"
                            required
                            error={errors.slug}
                            hint="Unique ID used in the page markup. Lowercase letters, numbers and hyphens.">
                            <input
                                {...text("slug")}
                                maxLength={120}
                                spellCheck={false}
                                onChange={(e) => { setSlugTouched(true); set("slug", e.target.value.toLowerCase()); }} />
                        </FormField>

                        <FormField id="tagline" label="Tagline" error={errors.tagline} hint="One line under the title.">
                            <input {...text("tagline")} maxLength={200} />
                        </FormField>

                        <FormField
                            id="description"
                            label="Description"
                            error={errors.description}
                            count={{ value: descriptionLength, max: 5000 }}>
                            <textarea {...text("description")} rows={5} />
                        </FormField>
                    </div>
                </DashboardCard>

                <DashboardCard title="Details" icon={AdminIcons.Briefcase} subtitle="Shown on the project card. All optional.">
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="kind" label="Type" error={errors.kind}>
                            <Select
                                id="field-kind"
                                value={values.kind}
                                options={[{ value: "", label: "None" }, ...PROJECT_KINDS.map((kind) => ({ value: kind, label: kind }))]}
                                aria-invalid={!!errors.kind || undefined}
                                aria-describedby={errors.kind ? "field-kind-error" : undefined}
                                onChange={(v) => set("kind", v)} />
                        </FormField>
                        <FormField id="period" label="Period" error={errors.period} hint="e.g. 2023 – Present">
                            <input {...text("period")} maxLength={60} />
                        </FormField>
                        <FormField id="role" label="Your role" error={errors.role}>
                            <input {...text("role")} maxLength={120} />
                        </FormField>
                        <FormField id="organization" label="Company / school" error={errors.organization}>
                            <input {...text("organization")} maxLength={160} />
                        </FormField>
                    </div>
                </DashboardCard>

                <DashboardCard title="Highlights & tech" icon={AdminIcons.Code}>
                    <div className={formStyles.fields}>
                        <FormField
                            id="highlights"
                            label="Highlights"
                            error={errors.highlights}
                            hint={`Short bullet points, up to ${PROJECT_LIMITS.highlights}.`}>
                            <HighlightsInput
                                id="field-highlights"
                                items={values.highlights}
                                max={PROJECT_LIMITS.highlights}
                                maxLength={PROJECT_LIMITS.highlight}
                                onChange={(items) => set("highlights", items)} />
                        </FormField>

                        <FormField
                            id="tech"
                            label="Built with"
                            error={errors.tech}
                            hint="Press Enter or comma to add. Known names get their logo on the site.">
                            <TagInput
                                id="field-tech"
                                items={values.tech}
                                max={PROJECT_LIMITS.tech}
                                maxLength={PROJECT_LIMITS.techName}
                                onChange={(items) => set("tech", items)} />
                        </FormField>
                    </div>
                </DashboardCard>

                <DashboardCard title="Links" icon={AdminIcons.ExternalLink}>
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="live_url" label="Live site URL" error={errors.live_url}>
                            <input {...text("live_url")} type="url" inputMode="url" placeholder="https://" spellCheck={false} />
                        </FormField>
                        <FormField id="live_label" label="Button label" error={errors.live_label} hint='Default: "Open Live Site"'>
                            <input {...text("live_label")} maxLength={40} />
                        </FormField>
                        <FormField id="source_url" label="Source code URL" error={errors.source_url}>
                            <input {...text("source_url")} type="url" inputMode="url" placeholder="https://github.com/…" spellCheck={false} />
                        </FormField>
                        <FormField id="source_label" label="Button label" error={errors.source_label} hint='Default: "View Source Code"'>
                            <input {...text("source_label")} maxLength={40} />
                        </FormField>
                    </div>
                    <div className={formStyles.fields}>
                        <FormField id="note" label="Note" error={errors.note} hint="Shown under the links, e.g. why the source isn't public.">
                            <input {...text("note")} maxLength={200} />
                        </FormField>
                    </div>
                </DashboardCard>

                <DashboardCard title="Images" icon={AdminIcons.Image} subtitle="Choose from the Media Library, or upload there.">
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="logo_url" label="Logo" note="Square image" error={errors.logo_url}>
                            <AssetInput {...text("logo_url")} shape="square" />
                        </FormField>
                        <FormField id="image_url" label="Screenshot" note="Shown on the featured card" error={errors.image_url}>
                            <AssetInput {...text("image_url")} shape="wide" />
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
                                    <small>{status === "draft" ? "Only visible here" : "Shown on your Projects page"}</small>
                                </span>
                            </label>
                        ))}
                    </fieldset>

                    <label className={formStyles.checkbox}>
                        <input
                            id="field-is_featured"
                            type="checkbox"
                            checked={values.is_featured}
                            onChange={(e) => set("is_featured", e.target.checked)} />
                        <span>
                            <strong>Featured project</strong>
                            <small>The large card at the top. Replaces the current featured project.</small>
                        </span>
                    </label>
                    {errors.is_featured && <p className={formStyles["field-error"]} role="alert">{errors.is_featured}</p>}

                    <FormField id="sort_order" label="Display order" error={errors.sort_order} hint="Lower numbers appear first.">
                        <input {...text("sort_order")} type="number" min={0} max={9999} step={1} inputMode="numeric" />
                    </FormField>

                    {project && (
                        <dl className={formStyles.meta}>
                            <div><dt>Created</dt><dd><TimeAgo iso={project.created_at} /></dd></div>
                            <div><dt>Last saved</dt><dd><TimeAgo iso={project.updated_at} /></dd></div>
                            {project.published_at && <div><dt>First published</dt><dd><TimeAgo iso={project.published_at} /></dd></div>}
                        </dl>
                    )}
                </DashboardCard>

                {project && (
                    <DashboardCard title="Danger zone" icon={AdminIcons.AlertCircle}>
                        <p className={formStyles["field-hint"]}>Deleting is permanent. To hide a project, set it to Draft instead.</p>
                        <button type="button" className={`liquid_glass_btn ${adminStyles["btn-danger"]}`} onClick={() => setConfirm("delete")}>
                            Delete project
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
                <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={saving || (isEdit && !isDirty)}>
                    <AdminIcons.Check width={15} height={15} />
                    {saving ? "Saving…" : isEdit ? "Save changes" : values.status === "published" ? "Create & publish" : "Create draft"}
                </button>
            </div>

            <ConfirmDialog
                open={confirm === "discard"}
                title="Discard unsaved changes?"
                description="Your edits to this project haven't been saved."
                confirmLabel="Discard changes"
                danger
                onConfirm={() => { setBaseline(values); setConfirm(null); router.push("/admin/projects"); }}
                onCancel={() => setConfirm(null)} />

            <ConfirmDialog
                open={confirm === "delete"}
                title="Delete this project?"
                description={<><strong>{project?.title}</strong> will be removed permanently. This can&apos;t be undone.</>}
                confirmLabel="Delete project"
                danger
                busy={pendingId !== null}
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)} />
        </form>
    );
}
