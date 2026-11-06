'use client'

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sileo } from "sileo";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DashboardCard from "@/components/admin/DashboardCard";
import TimeAgo from "@/components/admin/TimeAgo";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { formatBytes, isImageMime, MEDIA_TYPES, MediaMime } from "@/utils/media";
import { MediaAsset } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import formStyles from "@/styles/pages/adminForm.module.css";
import styles from "@/styles/pages/adminMedia.module.css";

interface MediaDetailsProps {
    asset:     MediaAsset;
    onDeleted: () => void;
    onChanged: () => void;
}

/** Side panel for one file: preview, facts, link, alt text, usages, delete. */
export default function MediaDetails({ asset, onDeleted, onChanged }: MediaDetailsProps) {
    const [alt,        setAlt]        = useState<string>(asset.alt_text ?? "");
    const [savingAlt,  setSavingAlt]  = useState<boolean>(false);
    const [confirming, setConfirming] = useState<boolean>(false);
    const [deleting,   setDeleting]   = useState<boolean>(false);

    const isImage = isImageMime(asset.mime_type);
    const inUse   = asset.usages.length > 0;

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(asset.url);
            sileo.success({ title: "Link copied" });
        } catch {
            sileo.error({ title: "Couldn't copy", description: "Select the link and copy it manually." });
        }
    };

    const saveAlt = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSavingAlt(true);
        try {
            const res  = await fetch(networkDefine.ADMIN_MEDIA_ITEM_API(asset.id), {
                method:  "PATCH",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ alt_text: alt }),
            });
            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.result) {
                sileo.error({ title: "Couldn't save alt text", description: json?.message ?? "Please try again." });
                return;
            }
            sileo.success({ title: "Alt text saved" });
            onChanged();
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
        } finally {
            setSavingAlt(false);
        }
    };

    const remove = async () => {
        setDeleting(true);
        try {
            const res  = await fetch(networkDefine.ADMIN_MEDIA_ITEM_API(asset.id), { method: "DELETE" });
            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.result) {
                sileo.error({ title: "Couldn't delete file", description: json?.message ?? "Please try again." });
                return;
            }
            sileo.success({ title: "File deleted", description: asset.file_name });
            onDeleted();
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
        } finally {
            setDeleting(false);
            setConfirming(false);
        }
    };

    return (
        <DashboardCard title="Details" icon={AdminIcons.FileText}>
            <div className={styles["detail-preview"]}>
                {isImage
                    ? <Image src={asset.url} alt={asset.alt_text ?? ""} fill sizes="320px" />
                    : <span className={styles.doc}><AdminIcons.FileText width={32} height={32} />PDF</span>}
            </div>

            <p className={styles["detail-name"]}>{asset.file_name}</p>

            <dl className={formStyles.meta}>
                <div><dt>Type</dt><dd>{MEDIA_TYPES[asset.mime_type as MediaMime]?.label ?? asset.mime_type}</dd></div>
                <div><dt>Size</dt><dd>{formatBytes(asset.size_bytes)}</dd></div>
                {asset.width && asset.height && <div><dt>Dimensions</dt><dd>{asset.width} × {asset.height}</dd></div>}
                <div><dt>Uploaded</dt><dd><TimeAgo iso={asset.created_at} /></dd></div>
                {asset.source_path && <div><dt>Imported from</dt><dd className={styles.mono}>{asset.source_path}</dd></div>}
            </dl>

            <div className={styles["detail-actions"]}>
                <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={copyUrl}>
                    <AdminIcons.ExternalLink width={14} height={14} />
                    Copy link
                </button>
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className={adminStyles["btn-ghost"]}>
                    Open
                </a>
            </div>

            {isImage && (
                <form className={formStyles.fields} onSubmit={saveAlt}>
                    <div className={formStyles.field}>
                        <div className={formStyles["field-label"]}>
                            <label htmlFor="media-alt">Alt text</label>
                            <span>{alt.length}/300</span>
                        </div>
                        <input id="media-alt" value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image for screen readers" />
                    </div>
                    <button
                        type="submit"
                        className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                        disabled={savingAlt || alt.trim() === (asset.alt_text ?? "")}>
                        {savingAlt ? "Saving…" : "Save alt text"}
                    </button>
                </form>
            )}

            <div className={styles.usages}>
                <p className={styles["usages-title"]}>Used by</p>
                {inUse ? (
                    <ul>
                        {asset.usages.map((u) => (
                            <li key={`${u.href}-${u.label}`}><Link href={u.href}>{u.label}</Link></li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.muted}>Not used anywhere yet.</p>
                )}
            </div>

            <button
                type="button"
                className={`liquid_glass_btn ${adminStyles["btn-danger"]}`}
                disabled={inUse}
                title={inUse ? "Replace it where it's used before deleting" : undefined}
                onClick={() => setConfirming(true)}>
                Delete file
            </button>
            {inUse && <p className={styles.muted}>In use, so it can&apos;t be deleted. Replace it in the places above first.</p>}

            <ConfirmDialog
                open={confirming}
                danger
                title="Delete this file?"
                description={<><strong>{asset.file_name}</strong> will be removed from storage ({formatBytes(asset.size_bytes)} freed). This can&apos;t be undone.</>}
                confirmLabel="Delete file"
                busy={deleting}
                onConfirm={remove}
                onCancel={() => setConfirming(false)} />
        </DashboardCard>
    );
}
