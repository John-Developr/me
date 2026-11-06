'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import EmptyState from "@/components/admin/EmptyState";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { isImageMime } from "@/utils/media";
import { MediaAsset, StorageUsage } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminMedia.module.css";

import MediaGrid from "./MediaGrid";
import MediaUploader from "./MediaUploader";
import StorageUsageCard from "./StorageUsageCard";

export type MediaKind = "image" | "document";

interface MediaPickerDialogProps {
    open:     boolean;
    kind:     MediaKind;
    onClose:  () => void;
    onChoose: (asset: MediaAsset) => void;
}

const ACCEPT: Record<MediaKind, string> = {
    image:    "image/png,image/jpeg,image/webp,image/gif,image/avif",
    document: "application/pdf",
};

/** Choose a file from the Media Library (or upload one) for a form field. */
export default function MediaPickerDialog({ open, kind, onClose, onChoose }: MediaPickerDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [assets,   setAssets]   = useState<MediaAsset[]>([]);
    const [usage,    setUsage]    = useState<StorageUsage | null>(null);
    const [state,    setState]    = useState<"loading" | "error" | "ready">("loading");
    const [query,    setQuery]    = useState<string>("");
    const [selected, setSelected] = useState<MediaAsset | null>(null);

    const load = useCallback(async () => {
        setState("loading");
        try {
            const res  = await fetch(networkDefine.ADMIN_MEDIA_API, { cache: "no-store" });
            const json = await res.json().catch(() => null);
            if (!res.ok || !json?.result) throw new Error();
            setAssets(json.data.assets);
            setUsage(json.data.usage);
            setState("ready");
        } catch {
            setState("error");
        }
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
            setSelected(null);
            setQuery("");
            load();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open, load]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return assets.filter((a) =>
            (kind === "image" ? isImageMime(a.mime_type) : a.mime_type === "application/pdf") &&
            (!q || a.file_name.toLowerCase().includes(q) || (a.alt_text ?? "").toLowerCase().includes(q)));
    }, [assets, query, kind]);

    const handleUploaded = (asset: MediaAsset) => {
        setAssets((prev) => [asset, ...prev]);
        setUsage((prev) => prev && { ...prev, usedBytes: prev.usedBytes + asset.size_bytes, fileCount: prev.fileCount + 1 });
        const fits = kind === "image" ? isImageMime(asset.mime_type) : asset.mime_type === "application/pdf";
        if (fits) setSelected(asset);
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.picker}
            aria-labelledby="media-picker-title"
            onCancel={(e) => { e.preventDefault(); onClose(); }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <header className={styles["picker-head"]}>
                <h2 id="media-picker-title">{kind === "image" ? "Choose an image" : "Choose a PDF"}</h2>
                <button type="button" className={adminStyles["icon-btn"]} aria-label="Close" onClick={onClose}>
                    <AdminIcons.Close />
                </button>
            </header>

            <div className={styles["picker-body"]}>
                {usage && <StorageUsageCard usage={usage} compact />}
                <MediaUploader accept={ACCEPT[kind]} onUploaded={handleUploaded} />

                <label className={styles.search}>
                    <AdminIcons.Search width={16} height={16} />
                    <input
                        type="search"
                        placeholder="Search by name or alt text"
                        aria-label="Search media"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        // The picker lives inside edit forms: Enter here must not submit them.
                        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
                </label>

                {state === "loading" ? (
                    <p className={styles.muted}>Loading library…</p>
                ) : state === "error" ? (
                    <div className={adminStyles.error} role="alert">
                        <AdminIcons.AlertCircle width={18} height={18} />
                        <p>Couldn&apos;t load the library.</p>
                        <button type="button" className={adminStyles["btn-ghost"]} onClick={load}>Retry</button>
                    </div>
                ) : visible.length === 0 ? (
                    <EmptyState
                        compact
                        icon={AdminIcons.Image}
                        title={assets.length ? "No matching files" : "Your library is empty"}
                        description={kind === "image" ? "Upload an image above." : "Upload a PDF above."} />
                ) : (
                    <MediaGrid assets={visible} selectedId={selected?.id ?? null} onSelect={setSelected} />
                )}
            </div>

            <footer className={styles["picker-foot"]}>
                <p className={styles.muted}>{selected ? selected.file_name : "Select a file"}</p>
                <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={onClose}>Cancel</button>
                <button
                    type="button"
                    className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}
                    disabled={!selected}
                    onClick={() => { if (selected) { onChoose(selected); onClose(); } }}>
                    Use this file
                </button>
            </footer>
        </dialog>
    );
}
