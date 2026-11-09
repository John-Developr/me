'use client'

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import AssetInput from "@/components/admin/AssetInput";
import DashboardCard from "@/components/admin/DashboardCard";
import FormField from "@/components/admin/FormField";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { BASE_URL } from "@/config/siteUrl";
import { isAssetRef } from "@/utils/admin/fieldSchemas";
import { toFieldErrors } from "@/utils/admin/formErrors";
import { sendJson } from "@/utils/admin/sendJson";
import { DEFAULT_FAVICON, siteSettingsSchema } from "@/utils/admin/siteSettingsSchema";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminSeo.module.css";

interface SiteIconFormProps {
    faviconUrl: string | null;
    updatedAt:  string | null;
}

/** Recommended: square PNG, at least this size (covers the iPhone home screen icon). */
const RECOMMENDED_PX = 180;

export default function SiteIconForm({ faviconUrl, updatedAt }: SiteIconFormProps) {
    const router = useRouter();

    const [value,  setValue]  = useState<string>(faviconUrl ?? "");
    const [saved,  setSaved]  = useState<string>(faviconUrl ?? "");
    const [error,  setError]  = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);
    const [size,   setSize]   = useState<{ src: string; w: number; h: number } | null>(null);

    const src      = value.trim() && isAssetRef(value.trim()) ? value.trim() : DEFAULT_FAVICON;
    const isDirty  = value.trim() !== saved;
    const measured = size?.src === src ? size : null;
    const warning  = !measured || src === DEFAULT_FAVICON ? null
        : measured.w !== measured.h ? `This image is ${measured.w}×${measured.h}. Icons look best square; it will be squeezed.`
        : measured.w < RECOMMENDED_PX ? `This image is ${measured.w}×${measured.h}. Use at least ${RECOMMENDED_PX}×${RECOMMENDED_PX} so it stays sharp on phones.`
        : null;

    const save = async (nextValue: string) => {
        const parsed = siteSettingsSchema.safeParse({ favicon_url: nextValue });
        if (!parsed.success) {
            setError(toFieldErrors(parsed.error).favicon_url ?? "Choose an image.");
            return;
        }

        setSaving(true);
        const res = await sendJson(networkDefine.ADMIN_SITE_SETTINGS_API, "PUT", parsed.data);
        setSaving(false);

        if (!res.result) {
            setError(res.errors?.favicon_url ?? "");
            sileo.error({ title: "Couldn't save the site icon", description: res.message });
            return;
        }

        setValue(nextValue);
        setSaved(nextValue);
        setError("");
        sileo.success({
            title:       nextValue ? "Site icon updated" : "Default icon restored",
            description: "Browsers may keep the old icon for a while; a hard refresh shows the new one.",
        });
        router.refresh();
    };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        save(value.trim());
    };

    const host = BASE_URL.replace(/^https?:\/\//, "");

    return (
        <div className={`${formStyles.form} ${formStyles.balanced}`}>
            <div className={formStyles["form-main"]}>
                <DashboardCard title="Site icon" icon={AdminIcons.Image} subtitle="The favicon: browser tabs, bookmarks, search results and phone home screens.">
                    <form className={formStyles.fields} onSubmit={onSubmit} noValidate>
                        <FormField
                            id="favicon_url"
                            label="Icon image"
                            error={error}
                            hint={`Square PNG, ${RECOMMENDED_PX}×${RECOMMENDED_PX} or larger (512×512 is ideal). Leave empty to use the default icon.`}>
                            <AssetInput
                                id="field-favicon_url"
                                name="favicon_url"
                                value={value}
                                kind="image"
                                shape="square"
                                aria-invalid={!!error || undefined}
                                aria-describedby={error ? "field-favicon_url-error" : undefined}
                                onChange={(e) => { setValue(e.target.value); setError(""); }} />
                        </FormField>

                        {warning && (
                            <p className={styles.warning} role="status">
                                <AdminIcons.AlertCircle width={14} height={14} /> {warning}
                            </p>
                        )}

                        <div className={styles.actions}>
                            {saved && (
                                <button
                                    type="button"
                                    className={adminStyles["btn-ghost"]}
                                    disabled={saving}
                                    onClick={() => save("")}>
                                    Use default icon
                                </button>
                            )}
                            <button
                                type="submit"
                                className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}
                                disabled={saving || !isDirty}>
                                {saving ? "Saving…" : "Save icon"}
                            </button>
                        </div>
                    </form>

                    {updatedAt && saved && (
                        <p className={styles.meta}>Last changed <TimeAgo iso={updatedAt} /></p>
                    )}
                </DashboardCard>
            </div>

            <aside className={formStyles["form-side"]}>
                <DashboardCard title="Preview" icon={AdminIcons.Eye} subtitle={isDirty ? "Unsaved: this is how it will look." : "How it looks now."}>
                    {/* Hidden probe to read the image's real size */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={src}
                        alt=""
                        className={styles.probe}
                        onLoad={(e) => setSize({ src, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />

                    <p className={styles.label}>Browser tab</p>
                    <div className={styles.tabs}>
                        <div className={`${styles.tab} ${styles.light}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" width={16} height={16} />
                            <span>John Carlo Ylanan | Web &amp; Mobile…</span>
                            <AdminIcons.Close width={11} height={11} />
                        </div>
                        <div className={`${styles.tab} ${styles.dark}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" width={16} height={16} />
                            <span>John Carlo Ylanan | Web &amp; Mobile…</span>
                            <AdminIcons.Close width={11} height={11} />
                        </div>
                    </div>

                    <p className={styles.label}>Search result</p>
                    <div className={styles.search}>
                        <span className={styles["search-icon"]}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" width={18} height={18} />
                        </span>
                        <span className={styles["search-text"]}>
                            <strong>John Carlo Ylanan</strong>
                            <small>{host}</small>
                        </span>
                    </div>

                    <p className={styles.label}>Phone home screen</p>
                    <div className={styles.home}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" width={56} height={56} />
                        <small>John Carlo</small>
                    </div>
                </DashboardCard>
            </aside>
        </div>
    );
}
