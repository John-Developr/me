'use client'

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import DashboardCard from "@/components/admin/DashboardCard";
import FormField from "@/components/admin/FormField";
import AssetInput from "@/components/admin/AssetInput";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { BASE_URL } from "@/config/siteUrl";
import { toFieldErrors } from "@/utils/admin/formErrors";
import { getProfileCompletion, MIN_BIO_LENGTH, PROFILE_COMPLETION_RULES } from "@/utils/admin/profileCompletion";
import { profileInputSchema } from "@/utils/admin/profileSchema";
import { PortfolioProfile } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import dashStyles from "@/styles/pages/adminDashboard.module.css";

// ─── Form state ──────────────────────────────────────────────

const FIELDS = [
    "full_name", "headline", "location", "bio", "avatar_url",
    "email", "phone", "booking_url", "resume_url",
    "github_url", "linkedin_url", "facebook_url", "instagram_url", "x_url", "website_url",
] as const;

type FieldKey  = (typeof FIELDS)[number];
type FormState = Record<FieldKey, string>;

const fromProfile = (p: PortfolioProfile | null): FormState =>
    Object.fromEntries(FIELDS.map((key) => [key, p?.[key] ?? ""])) as FormState;

interface ProfileApiResponse {
    result:   boolean;
    message:  string;
    data?:    PortfolioProfile;
    errors?:  Record<string, string>;
}

// ─── Editor ──────────────────────────────────────────────────

export default function ProfileEditor({ profile }: { profile: PortfolioProfile | null }) {
    const router = useRouter();

    const initial = useMemo(() => fromProfile(profile), [profile]);

    const [values,    setValues]    = useState<FormState>(initial);
    const [baseline,  setBaseline]  = useState<FormState>(initial);
    const [errors,    setErrors]    = useState<Record<string, string>>({});
    const [saving,    setSaving]    = useState<boolean>(false);
    const [updatedAt, setUpdatedAt] = useState<string | null>(profile?.updated_at ?? null);

    const isDirty = useMemo(() => FIELDS.some((key) => values[key] !== baseline[key]), [values, baseline]);

    // Live score with the same rules as the dashboard.
    const completion = useMemo(() => getProfileCompletion({ ...values, updated_at: "" }), [values]);

    useEffect(() => {
        if (!isDirty) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [isDirty]);

    const input = (key: FieldKey) => ({
        id:                 `field-${key}`,
        name:               key,
        value:              values[key],
        "aria-invalid":     !!errors[key] || undefined,
        "aria-describedby": errors[key] ? `field-${key}-error` : undefined,
        onChange:           (e: { target: { value: string } }) => {
            setValues((prev) => ({ ...prev, [key]: e.target.value }));
            if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
        },
    });

    const focusField = (key: string) => document.getElementById(`field-${key}`)?.focus();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving) return;

        const parsed = profileInputSchema.safeParse(values);
        if (!parsed.success) {
            const fieldErrors = toFieldErrors(parsed.error);
            setErrors(fieldErrors);
            focusField(Object.keys(fieldErrors)[0]);
            return;
        }

        setSaving(true);

        try {
            const res  = await fetch(networkDefine.ADMIN_PROFILE_API, {
                method:  "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(parsed.data),
            });
            const json = (await res.json().catch(() => null)) as ProfileApiResponse | null;

            if (!res.ok || !json?.result || !json.data) {
                if (json?.errors) {
                    setErrors(json.errors);
                    focusField(Object.keys(json.errors)[0]);
                }
                sileo.error({ title: "Couldn't save profile", description: json?.message ?? "Please try again." });
                return;
            }

            const saved = fromProfile(json.data);
            setValues(saved);
            setBaseline(saved);
            setUpdatedAt(json.data.updated_at);
            sileo.success({ title: "Profile saved", description: "Your home page is updated." });
            router.refresh();
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
        } finally {
            setSaving(false);
        }
    };

    const bioLength = values.bio.trim().length;

    return (
        <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
            <div className={formStyles["form-main"]}>
                {!profile && (
                    <p className={formStyles["field-hint"]}>
                        No profile is saved yet, so your home page shows its built-in defaults.
                        Saving here creates your profile.
                    </p>
                )}

                <DashboardCard title="Identity" icon={AdminIcons.User} subtitle="The top of your home page.">
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="full_name" label="Full name" required error={errors.full_name}>
                            <input {...input("full_name")} maxLength={120} autoComplete="name" />
                        </FormField>
                        <FormField id="headline" label="Headline" error={errors.headline} hint="e.g. Full Stack Developer">
                            <input {...input("headline")} maxLength={160} />
                        </FormField>
                        <FormField id="location" label="Location" error={errors.location}>
                            <input {...input("location")} maxLength={120} />
                        </FormField>
                        <FormField id="avatar_url" label="Photo" note="Square image" error={errors.avatar_url}>
                            <AssetInput {...input("avatar_url")} shape="square" />
                        </FormField>
                    </div>
                </DashboardCard>

                <DashboardCard title="About me" icon={AdminIcons.FileText}>
                    <FormField
                        id="bio"
                        label="Bio"
                        error={errors.bio}
                        count={{ value: bioLength, max: 5000 }}
                        hint={`Leave a blank line between paragraphs. ${MIN_BIO_LENGTH}+ characters counts toward completion.`}>
                        <textarea {...input("bio")} rows={8} />
                    </FormField>
                </DashboardCard>

                <DashboardCard title="Contact" icon={AdminIcons.Mail} subtitle="Hero buttons and the “Connect.” card. Leave blank to hide.">
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="email" label="Email" error={errors.email} hint="Also used by the Send Email button.">
                            <input {...input("email")} type="email" inputMode="email" autoComplete="email" spellCheck={false} />
                        </FormField>
                        <FormField id="phone" label="Phone" error={errors.phone} hint="Header and Connect card, after the PH flag.">
                            <input {...input("phone")} type="tel" inputMode="tel" autoComplete="tel" />
                        </FormField>
                        <FormField id="booking_url" label="Booking link" error={errors.booking_url} hint="Schedule a Call buttons, e.g. your Calendly link.">
                            <input {...input("booking_url")} type="url" inputMode="url" placeholder="https://calendly.com/…" spellCheck={false} />
                        </FormField>
                        <FormField id="resume_url" label="Resume" note="PDF for the Download Resume button" error={errors.resume_url}>
                            <AssetInput {...input("resume_url")} kind="document" />
                        </FormField>
                    </div>
                </DashboardCard>

                <DashboardCard title="Social links" icon={AdminIcons.ExternalLink} subtitle="Header LinkedIn button and footer icons. Empty ones are hidden.">
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="linkedin_url" label="LinkedIn" error={errors.linkedin_url}>
                            <input {...input("linkedin_url")} type="url" inputMode="url" placeholder="https://linkedin.com/in/…" spellCheck={false} />
                        </FormField>
                        <FormField id="github_url" label="GitHub" error={errors.github_url}>
                            <input {...input("github_url")} type="url" inputMode="url" placeholder="https://github.com/…" spellCheck={false} />
                        </FormField>
                        <FormField id="facebook_url" label="Facebook" error={errors.facebook_url}>
                            <input {...input("facebook_url")} type="url" inputMode="url" placeholder="https://facebook.com/…" spellCheck={false} />
                        </FormField>
                        <FormField id="instagram_url" label="Instagram" error={errors.instagram_url}>
                            <input {...input("instagram_url")} type="url" inputMode="url" placeholder="https://instagram.com/…" spellCheck={false} />
                        </FormField>
                        <FormField id="x_url" label="X (Twitter)" error={errors.x_url}>
                            <input {...input("x_url")} type="url" inputMode="url" placeholder="https://x.com/…" spellCheck={false} />
                        </FormField>
                        <FormField id="website_url" label="Website" error={errors.website_url} hint="Optional, e.g. a blog elsewhere.">
                            <input {...input("website_url")} type="url" inputMode="url" placeholder="https://" spellCheck={false} />
                        </FormField>
                    </div>
                </DashboardCard>
            </div>

            <aside className={formStyles["form-side"]}>
                <DashboardCard title="Completion" icon={AdminIcons.Check} subtitle="Updates as you type.">
                    <div className={dashStyles["completion-head"]}>
                        <p>Profile completion</p>
                        <strong>{completion.percent}%</strong>
                    </div>
                    <div
                        className={dashStyles.progress}
                        role="progressbar"
                        aria-label="Profile completion"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={completion.percent}>
                        <span style={{ width: `${completion.percent}%` }} />
                    </div>

                    {completion.missing.length === 0 ? (
                        <p className={formStyles["field-hint"]}>All {PROFILE_COMPLETION_RULES.length} items are filled in.</p>
                    ) : (
                        <ul className={formStyles.missing}>
                            {PROFILE_COMPLETION_RULES.filter((rule) => completion.missing.includes(rule.label)).map((rule) => (
                                <li key={rule.label}>
                                    <button type="button" onClick={() => focusField(rule.field)}>
                                        <AdminIcons.Plus width={13} height={13} />
                                        {rule.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </DashboardCard>

                <DashboardCard title="Where this appears" icon={AdminIcons.Eye}>
                    <p className={formStyles["field-hint"]}>
                        Home page hero, &ldquo;About Me.&rdquo; and &ldquo;Connect.&rdquo; cards, plus the phone, LinkedIn
                        button and social icons in the header and footer of every page. Changes go live when you save.
                    </p>
                    <a href={BASE_URL} target="_blank" rel="noopener noreferrer" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}>
                        <AdminIcons.ExternalLink width={15} height={15} />
                        View home page
                    </a>
                    {updatedAt && (
                        <dl className={formStyles.meta}>
                            <div><dt>Last saved</dt><dd><TimeAgo iso={updatedAt} /></dd></div>
                        </dl>
                    )}
                </DashboardCard>
            </aside>

            <div className={formStyles["save-bar"]}>
                <p className={formStyles["save-status"]} aria-live="polite">
                    {isDirty ? "Unsaved changes" : profile ? "All changes saved" : ""}
                </p>
                {isDirty && (
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={() => { setValues(baseline); setErrors({}); }} disabled={saving}>
                        Discard
                    </button>
                )}
                <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={saving || !isDirty}>
                    <AdminIcons.Check width={15} height={15} />
                    {saving ? "Saving…" : profile ? "Save profile" : "Create profile"}
                </button>
            </div>
        </form>
    );
}
