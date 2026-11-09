'use client'

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import AssetInput from "@/components/admin/AssetInput";
import DashboardCard from "@/components/admin/DashboardCard";
import FormField from "@/components/admin/FormField";
import TagInput from "@/components/admin/TagInput";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { BASE_URL } from "@/config/siteUrl";
import { isAssetRef } from "@/utils/admin/fieldSchemas";
import { sendJson } from "@/utils/admin/sendJson";
import { SEO_LIMITS, SEO_PAGES, SeoPageKey } from "@/utils/admin/seoPages";
import { DEFAULT_FAVICON, seoSettingsSchema } from "@/utils/admin/siteSettingsSchema";
import { SeoPage, SeoSettingsData } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminSeo.module.css";

// ─── Form state ──────────────────────────────────────────────

interface SiteState {
    site_name:           string;
    twitter_handle:      string;
    google_verification: string;
    allow_indexing:      boolean;
    favicon_url:         string;
}

type PageState = Record<SeoPageKey, { title: string; description: string; keywords: string[]; share_image_url: string }>;

interface State {
    site:  SiteState;
    pages: PageState;
}

const fromData = ({ settings, pages }: SeoSettingsData): State => ({
    site: {
        site_name:           settings.site_name ?? "",
        twitter_handle:      settings.twitter_handle ?? "",
        google_verification: settings.google_verification ?? "",
        allow_indexing:      settings.allow_indexing,
        favicon_url:         settings.favicon_url ?? "",
    },
    pages: Object.fromEntries(SEO_PAGES.map(({ key }) => {
        const p = pages.find((row: SeoPage) => row.key === key);
        return [key, { title: p?.title ?? "", description: p?.description ?? "", keywords: p?.keywords ?? [], share_image_url: p?.share_image_url ?? "" }];
    })) as PageState,
});

/** Recommended: square icon at least this size (iPhone home screen). */
const ICON_PX = 180;

// ─── Form ────────────────────────────────────────────────────

export default function SeoSettingsForm({ data }: { data: SeoSettingsData }) {
    const router = useRouter();

    const initial = useMemo(() => fromData(data), [data]);

    const [values,   setValues]   = useState<State>(initial);
    const [baseline, setBaseline] = useState<State>(initial);
    const [pageKey,  setPageKey]  = useState<SeoPageKey>("home");
    const [errors,   setErrors]   = useState<Record<string, string>>({});
    const [saving,   setSaving]   = useState<boolean>(false);
    const [iconSize, setIconSize] = useState<{ src: string; w: number; h: number } | null>(null);

    const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);

    useEffect(() => {
        if (!isDirty) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [isDirty]);

    const page     = values.pages[pageKey];
    const pageInfo = SEO_PAGES.find((p) => p.key === pageKey)!;

    const setSite = <K extends keyof SiteState>(key: K, value: SiteState[K]) => {
        setValues((prev) => ({ ...prev, site: { ...prev.site, [key]: value } }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const setPage = <K extends keyof PageState[SeoPageKey]>(key: K, value: PageState[SeoPageKey][K]) => {
        setValues((prev) => ({ ...prev, pages: { ...prev.pages, [pageKey]: { ...prev.pages[pageKey], [key]: value } } }));
        const errorKey = `pages.${pageKey}.${key}`;
        if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    };

    /** Pages with errors, so their tab can show a marker. */
    const pagesWithErrors = new Set(Object.keys(errors).filter((k) => errors[k] && k.startsWith("pages.")).map((k) => k.split(".")[1]));

    const payload = () => ({
        settings: values.site,
        pages:    SEO_PAGES.map(({ key }) => ({ key, ...values.pages[key] })),
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving) return;

        const body   = payload();
        const parsed = seoSettingsSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of parsed.error.issues) {
                const [scope, a, b] = issue.path.map(String);
                const key = scope === "pages" ? `pages.${body.pages[Number(a)].key}.${b}` : a;
                if (!fieldErrors[key]) fieldErrors[key] = issue.message;
            }
            setErrors(fieldErrors);
            jumpToFirstError(fieldErrors);
            return;
        }

        setSaving(true);
        const res = await sendJson<SeoSettingsData>(networkDefine.ADMIN_SITE_SETTINGS_API, "PUT", parsed.data);
        setSaving(false);

        if (!res.result || !res.data) {
            if (res.errors) { setErrors(res.errors); jumpToFirstError(res.errors); }
            sileo.error({ title: "Couldn't save SEO settings", description: res.message });
            return;
        }

        const saved = fromData(res.data);
        setValues(saved);
        setBaseline(saved);
        setErrors({});
        sileo.success({ title: "SEO settings saved", description: "Every page is updated. Search engines pick changes up on their next visit." });
        router.refresh();
    };

    /** Switch to the page tab with the first error and focus the field. */
    const jumpToFirstError = (fieldErrors: Record<string, string>) => {
        const first = Object.keys(fieldErrors).find((k) => fieldErrors[k]);
        if (!first) return;
        if (first.startsWith("pages.")) {
            const [, key, field] = first.split(".");
            setPageKey(key as SeoPageKey);
            requestAnimationFrame(() => document.getElementById(`field-page-${field}`)?.focus());
        } else {
            document.getElementById(`field-${first}`)?.focus();
        }
    };

    // Preview values
    const host     = BASE_URL.replace(/^https?:\/\//, "");
    const icon     = values.site.favicon_url.trim() && isAssetRef(values.site.favicon_url.trim()) ? values.site.favicon_url.trim() : DEFAULT_FAVICON;
    const customShare = page.share_image_url.trim() && isAssetRef(page.share_image_url.trim()) ? page.share_image_url.trim() : null;
    // Generated card reflects saved settings; the timestamp busts the browser cache after a save.
    const ogImage  = customShare ?? `${pageInfo.path === "/" ? "" : pageInfo.path}/opengraph-image?v=${encodeURIComponent(data.settings.updated_at ?? "")}`;
    const crumbs   = pageInfo.path === "/" ? host : `${host} › ${pageInfo.path.slice(1)}`;
    const measured = iconSize?.src === icon ? iconSize : null;
    const iconWarning = !measured || icon === DEFAULT_FAVICON ? null
        : measured.w !== measured.h ? `This image is ${measured.w}×${measured.h}. Icons look best square.`
        : measured.w < ICON_PX ? `This image is ${measured.w}×${measured.h}. Use ${ICON_PX}×${ICON_PX} or larger so it stays sharp.`
        : null;

    const pageError = (field: string) => errors[`pages.${pageKey}.${field}`];

    return (
        <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
            <div className={formStyles["form-main"]}>
                {/* ─── Pages ─────────────────────────────────── */}
                <DashboardCard
                    title="Pages"
                    icon={AdminIcons.FileText}
                    subtitle="The title and description Google and social apps show for each page."
                    actions={
                        <div className={styles["page-tabs"]} role="tablist" aria-label="Page">
                            {SEO_PAGES.map((p) => (
                                <button
                                    key={p.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={pageKey === p.key}
                                    className={`${pageKey === p.key ? styles.on : ""} ${pagesWithErrors.has(p.key) ? styles.hasError : ""}`}
                                    onClick={() => setPageKey(p.key)}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    }>
                    <div className={formStyles.fields} role="tabpanel" aria-label={`${pageInfo.label} page`}>
                        <FormField
                            id="page-title"
                            label="Title"
                            required
                            error={pageError("title")}
                            count={{ value: page.title.trim().length, max: SEO_LIMITS.title }}
                            hint="The full title, exactly as it appears in search results and the browser tab. Google shows about 60 characters.">
                            <input
                                id="field-page-title"
                                value={page.title}
                                maxLength={70}
                                aria-invalid={!!pageError("title") || undefined}
                                onChange={(e) => setPage("title", e.target.value)} />
                        </FormField>

                        <FormField
                            id="page-description"
                            label="Description"
                            required
                            error={pageError("description")}
                            count={{ value: page.description.trim().length, max: SEO_LIMITS.description }}
                            hint="One or two sentences under the title in search results. Google shows about 160 characters.">
                            <textarea
                                id="field-page-description"
                                value={page.description}
                                rows={3}
                                maxLength={200}
                                aria-invalid={!!pageError("description") || undefined}
                                onChange={(e) => setPage("description", e.target.value)} />
                        </FormField>

                        <FormField
                            id="page-keywords"
                            label="Keywords"
                            error={pageError("keywords")}
                            hint="Optional. Google ignores them for ranking; some other search engines still read them.">
                            <TagInput
                                id="field-page-keywords"
                                items={page.keywords}
                                max={20}
                                maxLength={60}
                                placeholder="e.g. web developer Cebu"
                                onChange={(items) => setPage("keywords", items)} />
                        </FormField>

                        <FormField
                            id="page-share_image_url"
                            label="Share image"
                            error={pageError("share_image_url")}
                            hint="Optional. The picture shown when this page is shared on Facebook, LinkedIn, X or Messenger. 1200×630 PNG or JPEG. Leave empty for the generated card (your profile photo with this page's title and description).">
                            <AssetInput
                                id="field-page-share_image_url"
                                name="share_image_url"
                                value={page.share_image_url}
                                kind="image"
                                shape="wide"
                                aria-invalid={!!pageError("share_image_url") || undefined}
                                onChange={(e) => setPage("share_image_url", e.target.value)} />
                        </FormField>
                    </div>
                </DashboardCard>

                {/* ─── Site ──────────────────────────────────── */}
                <DashboardCard title="Site" icon={AdminIcons.Globe} subtitle="Used across every page and share card.">
                    <div className={`${formStyles.fields} ${formStyles.two}`}>
                        <FormField id="site_name" label="Site name" required error={errors.site_name} hint="Other pages (like blog posts) show “Page | Site name”.">
                            <input
                                id="field-site_name"
                                value={values.site.site_name}
                                maxLength={60}
                                aria-invalid={!!errors.site_name || undefined}
                                onChange={(e) => setSite("site_name", e.target.value)} />
                        </FormField>
                        <FormField id="twitter_handle" label="X (Twitter) handle" error={errors.twitter_handle} hint="Credited on X share cards, e.g. @johncarlo_dev.">
                            <input
                                id="field-twitter_handle"
                                value={values.site.twitter_handle}
                                maxLength={60}
                                placeholder="@username"
                                spellCheck={false}
                                aria-invalid={!!errors.twitter_handle || undefined}
                                onChange={(e) => setSite("twitter_handle", e.target.value)} />
                        </FormField>
                    </div>
                </DashboardCard>

                {/* ─── Search engines ────────────────────────── */}
                <DashboardCard title="Search engines" icon={AdminIcons.Search}>
                    <div className={formStyles.fields}>
                        <label className={formStyles.checkbox}>
                            <input
                                type="checkbox"
                                checked={values.site.allow_indexing}
                                onChange={(e) => setSite("allow_indexing", e.target.checked)} />
                            <span>
                                <strong>Allow search engines to show this site</strong>
                                <small>Turn off to hide every page from Google and others (adds “noindex”). Leave on for a live portfolio.</small>
                            </span>
                        </label>

                        <FormField
                            id="google_verification"
                            label="Google Search Console verification"
                            error={errors.google_verification}
                            hint="Paste the code or the whole <meta> tag from Search Console → Settings → Ownership verification → HTML tag.">
                            <input
                                id="field-google_verification"
                                value={values.site.google_verification}
                                maxLength={300}
                                spellCheck={false}
                                placeholder="e.g. googlec34b432acc53a5cc"
                                aria-invalid={!!errors.google_verification || undefined}
                                onChange={(e) => setSite("google_verification", e.target.value)} />
                        </FormField>
                    </div>
                </DashboardCard>

                {/* ─── Site icon ─────────────────────────────── */}
                <DashboardCard title="Site icon" icon={AdminIcons.Image} subtitle="The favicon: browser tabs, bookmarks, search results and phone home screens.">
                    <FormField
                        id="favicon_url"
                        label="Icon image"
                        error={errors.favicon_url}
                        hint={`Square PNG, ${ICON_PX}×${ICON_PX} or larger (512×512 is ideal). Leave empty for the default icon.`}>
                        <AssetInput
                            id="field-favicon_url"
                            name="favicon_url"
                            value={values.site.favicon_url}
                            kind="image"
                            shape="square"
                            aria-invalid={!!errors.favicon_url || undefined}
                            onChange={(e) => setSite("favicon_url", e.target.value)} />
                    </FormField>
                    {iconWarning && (
                        <p className={styles.warning} role="status">
                            <AdminIcons.AlertCircle width={14} height={14} /> {iconWarning}
                        </p>
                    )}
                </DashboardCard>
            </div>

            {/* ─── Preview (sticky) ──────────────────────────── */}
            <aside className={formStyles["form-side"]}>
                <DashboardCard title="Preview" icon={AdminIcons.Eye} subtitle={`${pageInfo.label} page${isDirty ? " · unsaved" : ""}`}>
                    {/* Off-screen probe to read the icon's real size */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={icon} alt="" className={styles.probe}
                        onLoad={(e) => setIconSize({ src: icon, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />

                    {!values.site.allow_indexing && (
                        <p className={styles.hidden}>
                            <AdminIcons.AlertCircle width={14} height={14} /> Hidden from search engines
                        </p>
                    )}

                    <p className={styles.label}>Google</p>
                    <div className={`${styles.google} ${values.site.allow_indexing ? "" : styles.dim}`}>
                        <div className={styles["google-site"]}>
                            <span className={styles["google-icon"]}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={icon} alt="" width={16} height={16} />
                            </span>
                            <span>
                                <strong>{values.site.site_name || host}</strong>
                                <small>{crumbs}</small>
                            </span>
                        </div>
                        <p className={styles["google-title"]}>{page.title || "Page title"}</p>
                        <p className={styles["google-desc"]}>{page.description || "Page description."}</p>
                    </div>

                    <p className={styles.label}>
                        Share card · {customShare ? "custom image" : `generated${isDirty ? " (updates after you save)" : ""}`}
                    </p>
                    <div className={styles.social}>
                        {/* Generated by the page's opengraph-image route */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ogImage} alt="" className={styles["social-image"]} />
                        <div className={styles["social-text"]}>
                            <small>{host}</small>
                            <strong>{page.title || "Page title"}</strong>
                            <span>{page.description || "Page description."}</span>
                        </div>
                    </div>

                    <p className={styles.label}>Browser tab</p>
                    <div className={`${styles.tab} ${styles.light}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={icon} alt="" width={16} height={16} />
                        <span>{page.title || "Page title"}</span>
                        <AdminIcons.Close width={11} height={11} />
                    </div>

                    {data.settings.updated_at && (
                        <dl className={formStyles.meta}>
                            <div><dt>Last saved</dt><dd><TimeAgo iso={data.settings.updated_at} /></dd></div>
                        </dl>
                    )}
                </DashboardCard>
            </aside>

            <div className={formStyles["save-bar"]}>
                <p className={formStyles["save-status"]} aria-live="polite">
                    {isDirty ? "Unsaved changes" : "All changes saved"}
                </p>
                {isDirty && (
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} disabled={saving} onClick={() => { setValues(baseline); setErrors({}); }}>
                        Discard
                    </button>
                )}
                <button type="submit" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`} disabled={saving || !isDirty}>
                    <AdminIcons.Check width={15} height={15} />
                    {saving ? "Saving…" : "Save SEO settings"}
                </button>
            </div>
        </form>
    );
}
