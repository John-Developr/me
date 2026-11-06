'use client'

import { DragEvent, useId, useRef, useState } from "react";

import { AdminIcons } from "@/components/icons/admin";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { formatBytes, MAX_UPLOAD_BYTES, MEDIA_ACCEPT, MEDIA_TYPES, MediaMime } from "@/utils/media";
import { MediaAsset } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminMedia.module.css";

interface MediaUploaderProps {
    onUploaded: (asset: MediaAsset) => void;
    /** Restrict the file chooser (e.g. images only in an image field's picker). */
    accept?:    string;
}

/** Drop zone + file chooser with per-file progress. */
export default function MediaUploader({ onUploaded, accept = MEDIA_ACCEPT }: MediaUploaderProps) {
    const { items, upload, clearFinished } = useMediaUpload(onUploaded);
    const [dragging, setDragging] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const hintId   = useId();

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        upload(e.dataTransfer.files);
    };

    const busy  = items.some((i) => i.status === "uploading");
    const types = accept.split(",").map((m) => MEDIA_TYPES[m.trim() as MediaMime]?.label).filter(Boolean);
    const typeList = types.length > 1 ? `${types.slice(0, -1).join(", ")} or ${types.at(-1)}` : types[0];

    return (
        <div className={styles.uploader}>
            <div
                className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}>
                <AdminIcons.Image width={22} height={22} />
                <p><strong>Drag files here</strong> or</p>
                <button
                    type="button"
                    className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`}
                    aria-describedby={hintId}
                    onClick={() => inputRef.current?.click()}>
                    <AdminIcons.Plus width={14} height={14} />
                    Choose files
                </button>
                <small id={hintId}>{typeList} · up to {formatBytes(MAX_UPLOAD_BYTES)} each</small>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={accept}
                    hidden
                    onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
            </div>

            {items.length > 0 && (
                <ul className={styles.queue} aria-live="polite">
                    {items.map((item) => (
                        <li key={item.id} className={styles[item.status]}>
                            <span className={styles["queue-name"]}>{item.name}</span>
                            {item.status === "error"
                                ? <span className={styles["queue-error"]}>{item.error}</span>
                                : <span className={styles["queue-bar"]}><span style={{ width: `${item.progress}%` }} /></span>}
                            <span className={styles["queue-status"]}>
                                {item.status === "done" ? <AdminIcons.Check width={14} height={14} /> : item.status === "error" ? <AdminIcons.AlertCircle width={14} height={14} /> : `${item.progress}%`}
                            </span>
                        </li>
                    ))}
                    {!busy && (
                        <li className={styles["queue-clear"]}>
                            <button type="button" className={adminStyles["text-btn"]} onClick={clearFinished}>Clear list</button>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
