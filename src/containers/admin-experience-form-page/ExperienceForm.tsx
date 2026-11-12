'use client'

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DashboardCard from "@/components/admin/DashboardCard";
import FormField from "@/components/admin/FormField";
import MonthPicker from "@/components/admin/MonthPicker";
import Select from "@/components/admin/Select";
import AssetInput from "@/components/admin/AssetInput";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { EMPLOYMENT_TYPES, EXPERIENCE_LABELS, EXPERIENCE_TYPES, experienceInputSchema } from "@/utils/admin/experienceSchema";
import { isAssetRef } from "@/utils/admin/fieldSchemas";
import { toFieldErrors } from "@/utils/admin/formErrors";
import { formatDuration, formatRange, monthsBetween } from "@/utils/experienceTimeline";
import { ExperienceRecord, ExperienceType } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminExperience.module.css";

export interface KnownCompany {
    name: string;
    logo: string | null;
}

interface FormState {
    entry_type:      ExperienceType;
    company:         string;
    position:        string;
    employment_type: string;
    location:        string;
    start_date:      string;   // "YYYY-MM"
    end_date:        string;   // "YYYY-MM" or ""
    is_current:      boolean;
    description:     string;
    logo_url:        string;
}

type TextKey = Exclude<keyof FormState, "entry_type" | "is_current">;

const fromEntry = (e?: ExperienceRecord): FormState => ({
    entry_type:      e?.entry_type ?? "work",
    company:         e?.company ?? "",
    position:        e?.position ?? "",
    employment_type: e?.employment_type ?? "",
    location:        e?.location ?? "",
    start_date:      e?.start_date.slice(0, 7) ?? "",
    end_date:        e?.end_date?.slice(0, 7) ?? "",
    is_current:      !!e && e.entry_type !== "milestone" && e.end_date === null,
    description:     e?.description ?? "",
    logo_url:        e?.logo_url ?? "",
});

/** Form state → API body: current/milestone entries have no end. */
const toPayload = (s: FormState) => ({
    entry_type:      s.entry_type,
    company:         s.company,
    position:        s.position,
    employment_type: s.employment_type,
    location:        s.location,
    start_date:      s.start_date,
    end_date:        s.entry_type === "milestone" || s.is_current ? "" : s.end_date,
    description:     s.description,
    logo_url:        s.logo_url,
});

const CURRENT_LABEL: Record<Exclude<ExperienceType, "milestone">, string> = {
    work:      "I currently work here",
    education: "I'm currently studying here",
};

interface ExperienceFormProps {
    entry?:    ExperienceRecord;
    companies: KnownCompany[];
}

export default function ExperienceForm({ entry, companies }: ExperienceFormProps) {
    const router = useRouter();
    const isEdit = !!entry;

    const initial = useMemo(() => fromEntry(entry), [entry]);

    const [values,   setValues]   = useState<FormState>(initial);
    const [baseline, setBaseline] = useState<FormState>(initial);
    const [errors,   setErrors]   = useState<Record<string, string>>({});
    const [saving,   setSaving]   = useState<boolean>(false);
    const [confirm,  setConfirm]  = useState<"discard" | "delete" | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const isDirty   = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);
    const labels    = EXPERIENCE_LABELS[values.entry_type];
    const thisMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

    useEffect(() => {
        if (!isDirty) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [isDirty]);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const input = (key: TextKey) => ({
        id:                 `field-${key}`,
        name:               key,
        value:              values[key],
        "aria-invalid":     !!errors[key] || undefined,
        "aria-describedby": errors[key] ? `field-${key}-error` : undefined,
        onChange:           (e: { target: { value: string } }) => set(key, e.target.value),
    });

    /** Picking a known company fills in its logo (keeps grouped roles consistent). */
    const handleCompanyBlur = () => {
        if (values.logo_url) return;
        const match = companies.find((c) => c.name.trim().toLowerCase() === values.company.trim().toLowerCase());
        if (match?.logo) set("logo_url", match.logo);
    };

    const focusFirst = (errs: Record<string, string>) => {
        const first = Object.keys(errs).find((k) => errs[k]);
        if (first) document.getElementById(`field-${first}`)?.focus();
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving) return;

        const payload = toPayload(values);
        const parsed  = experienceInputSchema.safeParse(payload);
        if (!parsed.success) {
            const fieldErrors = toFieldErrors(parsed.error);
            setErrors(fieldErrors);
            focusFirst(fieldErrors);
            return;
        }

        setSaving(true);

        try {
            const res  = await fetch(
                isEdit ? networkDefine.ADMIN_EXPERIENCE_API(entry.id) : networkDefine.ADMIN_EXPERIENCES_API,
                { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
            );
            const json = await res.json().catch(() => null) as { result?: boolean; message?: string; data?: ExperienceRecord; errors?: Record<string, string> } | null;

            if (!res.ok || !json?.result || !json.data) {
                if (json?.errors) { setErrors(json.errors); focusFirst(json.errors); }
                sileo.error({ title: "Couldn't save entry", description: json?.message ?? "Please try again." });
                return;
            }

            sileo.success({ title: isEdit ? "Entry saved" : "Entry added", description: `${json.data.position} · ${json.data.company}` });

            if (isEdit) {
                const saved = fromEntry(json.data);
                setValues(saved);
                setBaseline(saved);
                router.refresh();
            } else {
                setBaseline(values);
                router.push("/admin/experience");
                router.refresh();
            }
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!entry) return;
        setDeleting(true);
        try {
            const res = await fetch(networkDefine.ADMIN_EXPERIENCE_API(entry.id), { method: "DELETE" });
            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.result) {
                sileo.error({ title: "Couldn't delete entry", description: json?.message ?? "Please try again." });
                return;
            }
            sileo.success({ title: "Entry deleted", description: entry.position });
            setBaseline(values);
            router.push("/admin/experience");
            router.refresh();
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
        } finally {
            setDeleting(false);
            setConfirm(null);
        }
    };

    // Live preview of the home page line.
    const preview = useMemo(() => {
        const start = /^\d{4}-\d{2}$/.test(values.start_date) ? `${values.start_date}-01` : null;
        const end   = values.entry_type === "milestone" || values.is_current || !/^\d{4}-\d{2}$/.test(values.end_date)
            ? null : `${values.end_date}-01`;
        if (!start) return null;
        return {
            range:    formatRange({ entry_type: values.entry_type, start_date: start, end_date: end }),
            duration: values.entry_type === "milestone" ? null : formatDuration(monthsBetween(start, end, new Date())),
        };
    }, [values]);

    const showEnd = values.entry_type !== "milestone";

    return (
        <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
            <div className={formStyles["form-main"]}>
                <DashboardCard title="Type" icon={AdminIcons.Layers}>
                    <fieldset className={`${formStyles.radios} ${formStyles["radios-row"]}`}>
                        <legend className={adminStyles["sr-only"]}>Entry type</legend>
                        {EXPERIENCE_TYPES.map((type) => (
                            <label key={type} className={values.entry_type === type ? formStyles.checked : ""}>
                                <input
                                    type="radio"
                                    name="entry_type"
                                    value={type}
                                    checked={values.entry_type === type}
                                    onChange={() => set("entry_type", type)} />
                                <span>
                                    <strong>{EXPERIENCE_LABELS[type].type}</strong>
                                    <small>
                                        {type === "work" ? "A role at a company" : type === "education" ? "A degree or course" : "A single moment"}
                                    </small>
                                </span>
                            </label>
                        ))}
                    </fieldset>
                </DashboardCard>

                <DashboardCard title="Details" icon={AdminIcons.Briefcase}>
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField
                            id="company"
                            label={labels.company}
                            required
                            error={errors.company}
                            hint={values.entry_type === "work" ? "Use the same name for each role to group them." : undefined}>
                            <input {...input("company")} maxLength={160} list="known-companies" onBlur={handleCompanyBlur} />
                        </FormField>
                        <datalist id="known-companies">
                            {companies.map((c) => <option key={c.name} value={c.name} />)}
                        </datalist>

                        <FormField id="position" label={labels.position} required error={errors.position}>
                            <input {...input("position")} maxLength={160} />
                        </FormField>

                        {values.entry_type === "work" && (
                            <FormField id="employment_type" label="Employment type" error={errors.employment_type}>
                                <Select
                                    id="field-employment_type"
                                    value={values.employment_type}
                                    options={[{ value: "", label: "Not specified" }, ...EMPLOYMENT_TYPES.map((t) => ({ value: t, label: t }))]}
                                    aria-invalid={!!errors.employment_type || undefined}
                                    aria-describedby={errors.employment_type ? "field-employment_type-error" : undefined}
                                    onChange={(v) => set("employment_type", v)} />
                            </FormField>
                        )}

                        {values.entry_type !== "milestone" && (
                            <FormField id="location" label="Location" error={errors.location} hint="Optional, e.g. Cebu City or Remote">
                                <input {...input("location")} maxLength={120} />
                            </FormField>
                        )}
                    </div>
                </DashboardCard>

                <DashboardCard title="Dates" icon={AdminIcons.Clock}>
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="start_date" label={showEnd ? "Start" : "Date"} required error={errors.start_date}>
                            <MonthPicker
                                id="field-start_date"
                                value={values.start_date}
                                max={thisMonth}
                                aria-invalid={!!errors.start_date || undefined}
                                aria-describedby={errors.start_date ? "field-start_date-error" : undefined}
                                onChange={(v) => set("start_date", v)} />
                        </FormField>

                        {showEnd && (
                            <FormField id="end_date" label="End" error={errors.end_date}>
                                <MonthPicker
                                    id="field-end_date"
                                    value={values.end_date}
                                    min={values.start_date || undefined}
                                    max={thisMonth}
                                    disabled={values.is_current}
                                    placeholder={values.is_current ? "Present" : "Pick a month"}
                                    clearable
                                    aria-invalid={!!errors.end_date || undefined}
                                    aria-describedby={errors.end_date ? "field-end_date-error" : undefined}
                                    onChange={(v) => set("end_date", v)} />
                            </FormField>
                        )}
                    </div>

                    {showEnd && (
                        <label className={formStyles.checkbox}>
                            <input
                                type="checkbox"
                                checked={values.is_current}
                                onChange={(e) => { set("is_current", e.target.checked); if (e.target.checked) set("end_date", ""); }} />
                            <span>
                                <strong>{CURRENT_LABEL[values.entry_type as "work" | "education"]}</strong>
                                <small>Shows “Present” and counts the duration up to this month.</small>
                            </span>
                        </label>
                    )}
                </DashboardCard>

                <DashboardCard title="More" icon={AdminIcons.FileText}>
                    <div className={formStyles.fields}>
                        <FormField
                            id="logo_url"
                            label="Logo"
                            note="Square image"
                            error={errors.logo_url}>
                            <AssetInput {...input("logo_url")} shape="square" />
                        </FormField>
                        <FormField
                            id="description"
                            label="Description"
                            error={errors.description}
                            count={{ value: values.description.trim().length, max: 5000 }}
                            hint="Optional notes. Not shown on the home page yet.">
                            <textarea {...input("description")} rows={4} />
                        </FormField>
                    </div>
                </DashboardCard>
            </div>

            <aside className={formStyles["form-side"]}>
                <DashboardCard title="Preview" icon={AdminIcons.Eye} subtitle="How this line reads on the home page.">
                    <div className={styles.preview}>
                        <span className={styles["preview-logo"]} aria-hidden="true">
                            {values.logo_url && isAssetRef(values.logo_url)
                                ? <Image src={values.logo_url} width={28} height={28} alt="" unoptimized />
                                : <AdminIcons.Briefcase width={14} height={14} />}
                        </span>
                        <div>
                            <h4>{values.company || labels.company}</h4>
                            <p className={styles.position}>{values.position || labels.position}</p>
                            <p>{preview ? preview.range : "Pick a date"}</p>
                            {preview?.duration && <p>{preview.duration}</p>}
                        </div>
                    </div>
                    <p className={formStyles["field-hint"]}>
                        Several roles at the same company show together, each with its duration.
                    </p>

                    {entry && (
                        <dl className={formStyles.meta}>
                            <div><dt>Created</dt><dd><TimeAgo iso={entry.created_at} /></dd></div>
                            <div><dt>Last saved</dt><dd><TimeAgo iso={entry.updated_at} /></dd></div>
                        </dl>
                    )}
                </DashboardCard>

                {entry && (
                    <DashboardCard title="Danger zone" icon={AdminIcons.AlertCircle}>
                        <p className={formStyles["field-hint"]}>Deleting removes this line from your timeline. It can&apos;t be undone.</p>
                        <button type="button" className={`liquid_glass_btn ${adminStyles["btn-danger"]}`} onClick={() => setConfirm("delete")}>
                            Delete entry
                        </button>
                    </DashboardCard>
                )}
            </aside>

            <div className={formStyles["save-bar"]}>
                <p className={formStyles["save-status"]} aria-live="polite">
                    {isDirty ? "Unsaved changes" : isEdit ? "All changes saved" : ""}
                </p>
                <button
                    type="button"
                    className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                    disabled={saving}
                    onClick={() => (isDirty ? setConfirm("discard") : router.push("/admin/experience"))}>
                    {isEdit ? "Back" : "Cancel"}
                </button>
                <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={saving || (isEdit && !isDirty)}>
                    <AdminIcons.Check width={15} height={15} />
                    {saving ? "Saving…" : isEdit ? "Save changes" : "Add entry"}
                </button>
            </div>

            <ConfirmDialog
                open={confirm === "discard"}
                danger
                title="Discard unsaved changes?"
                description="Your edits to this entry haven't been saved."
                confirmLabel="Discard changes"
                onConfirm={() => { setBaseline(values); setConfirm(null); router.push("/admin/experience"); }}
                onCancel={() => setConfirm(null)} />

            <ConfirmDialog
                open={confirm === "delete"}
                danger
                title="Delete this entry?"
                description={<><strong>{entry?.position}</strong> at {entry?.company} will be removed from your timeline.</>}
                confirmLabel="Delete entry"
                busy={deleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)} />
        </form>
    );
}
