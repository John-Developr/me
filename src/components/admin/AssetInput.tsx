'use client'

import { useState } from "react";
import Image from "next/image";

import { AdminIcons } from "@/components/icons/admin";
import MediaPickerDialog, { MediaKind } from "@/components/admin/media/MediaPickerDialog";
import { isAssetRef } from "@/utils/admin/fieldSchemas";
import { isMediaUrl } from "@/utils/media";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminForm.module.css";

interface AssetInputProps {
    id:                  string;
    name:                string;
    value:               string;
    onChange:            (e: { target: { value: string } }) => void;
    /** "image" shows a preview; "document" is for PDFs (e.g. the resume). */
    kind?:               MediaKind;
    shape?:              "square" | "wide";
    /** Only Media Library files: no typing a /public path (e.g. skill logos). */
    libraryOnly?:        boolean;
    "aria-invalid"?:     boolean;
    "aria-describedby"?: string;
}

/**
 * Field for an image or PDF: pick from the Media Library (or upload there),
 * or type a /public path (unless `libraryOnly`). Shows a live preview for images.
 */
export default function AssetInput({ kind = "image", shape = "square", libraryOnly = false, onChange, ...input }: AssetInputProps) {
    const [pickerOpen, setPickerOpen] = useState<boolean>(false);
    const [failedSrc,  setFailedSrc]  = useState<string | null>(null);

    const src     = input.value.trim();
    const valid   = libraryOnly ? isMediaUrl(src) : isAssetRef(src);
    const broken  = valid && failedSrc === src;
    const fromLib = valid && !src.startsWith("/");

    return (
        <div className={styles["image-input"]}>
            {kind === "image" ? (
                <span className={`${styles.preview} ${styles[shape]}`} aria-hidden="true">
                    {valid && !broken
                        ? <Image key={src} src={src} alt="" fill sizes="160px" unoptimized onError={() => setFailedSrc(src)} />
                        : <AdminIcons.Image width={18} height={18} />}
                </span>
            ) : (
                <span className={`${styles.preview} ${styles.square}`} aria-hidden="true">
                    <AdminIcons.FileText width={18} height={18} />
                </span>
            )}

            <div className={styles["image-field"]}>
                <div className={styles["asset-row"]}>
                    <input
                        {...input}
                        spellCheck={false}
                        readOnly={libraryOnly}
                        placeholder={libraryOnly
                            ? "Choose from the Media Library"
                            : kind === "image" ? "Choose from library or /images/…" : "Choose a PDF or /documents/…"}
                        onClick={libraryOnly ? () => setPickerOpen(true) : undefined}
                        onChange={(e) => onChange({ target: { value: e.target.value } })} />
                    {libraryOnly && src && (
                        <button
                            type="button"
                            className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                            aria-label="Remove"
                            title="Remove"
                            onClick={() => onChange({ target: { value: "" } })}>
                            <AdminIcons.Close width={14} height={14} />
                        </button>
                    )}
                    <button
                        type="button"
                        className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                        onClick={() => setPickerOpen(true)}>
                        <AdminIcons.Image width={14} height={14} />
                        Library
                    </button>
                </div>
                {broken && <small className={styles.warn}>No file found at this address.</small>}
                {libraryOnly && src && !valid && <small className={styles.warn}>Not a Media Library file. Choose one from the library.</small>}
                {valid && !broken && (
                    <small className={styles["asset-source"]}>{fromLib ? "From Media Library" : "File in /public (import it in Media Library)"}</small>
                )}
            </div>

            <MediaPickerDialog
                open={pickerOpen}
                kind={kind}
                onClose={() => setPickerOpen(false)}
                onChoose={(asset) => onChange({ target: { value: asset.url } })} />
        </div>
    );
}
