// hooks/useMediaUpload.ts
import { useCallback, useState } from "react";

import { networkDefine } from "@/config/networkDefine";
import { formatBytes, MAX_UPLOAD_BYTES, MEDIA_MIMES } from "@/utils/media";
import { MediaAsset } from "@/utils/types";

export interface UploadItem {
    id:       string;
    name:     string;
    progress: number;                          // 0–100
    status:   "uploading" | "done" | "error";
    error?:   string;
}

/** Width/height of an image file, measured in the browser (null if not an image). */
async function measure(file: File): Promise<{ width: number | null; height: number | null }> {
    if (!file.type.startsWith("image/")) return { width: null, height: null };
    try {
        const bitmap = await createImageBitmap(file);
        const size   = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return size;
    } catch {
        return { width: null, height: null };
    }
}

/** POST one file with progress (fetch can't report upload progress). */
function send(form: FormData, onProgress: (pct: number) => void): Promise<{ ok: boolean; message: string; asset?: MediaAsset }> {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", networkDefine.ADMIN_MEDIA_API);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
            let json: { result?: boolean; message?: string; data?: MediaAsset } | null = null;
            try { json = JSON.parse(xhr.responseText); } catch { /* non-JSON error page */ }
            const ok = xhr.status >= 200 && xhr.status < 300 && !!json?.result;
            resolve({
                ok,
                message: json?.message ?? (xhr.status === 413 ? `Files can be up to ${formatBytes(MAX_UPLOAD_BYTES)}.` : "Upload failed."),
                asset:   ok ? json?.data : undefined,
            });
        };
        xhr.onerror = () => resolve({ ok: false, message: "Network error. Check your connection." });
        xhr.send(form);
    });
}

/**
 * useMediaUpload — uploads files to the Media Library one by one with
 * per-file progress. Size and type are pre-checked here for fast feedback;
 * the server re-checks everything (including the real file type).
 *
 * @param onUploaded - Called with each stored asset
 *
 * @example
 * const { items, upload } = useMediaUpload((asset) => router.refresh());
 * <input type="file" multiple onChange={(e) => upload(e.target.files)} />
 */
export function useMediaUpload(onUploaded?: (asset: MediaAsset) => void) {
    const [items, setItems] = useState<UploadItem[]>([]);

    const update = (id: string, patch: Partial<UploadItem>) =>
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

    const upload = useCallback(async (fileList: FileList | File[] | null) => {
        const files = Array.from(fileList ?? []);
        if (!files.length) return;

        const queued = files.map((file) => ({ file, id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}` }));
        setItems((prev) => [...queued.map(({ file, id }) => ({ id, name: file.name, progress: 0, status: "uploading" as const })), ...prev]);

        for (const { file, id } of queued) {
            if (file.size > MAX_UPLOAD_BYTES) {
                update(id, { status: "error", error: `Too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_UPLOAD_BYTES)}.` });
                continue;
            }
            if (file.type && !MEDIA_MIMES.includes(file.type as (typeof MEDIA_MIMES)[number])) {
                update(id, { status: "error", error: "Use PNG, JPEG, WebP, GIF, AVIF or PDF." });
                continue;
            }

            const { width, height } = await measure(file);
            const form = new FormData();
            form.append("file", file);
            if (width && height) {
                form.append("width", String(width));
                form.append("height", String(height));
            }

            const res = await send(form, (progress) => update(id, { progress }));
            if (res.ok && res.asset) {
                update(id, { status: "done", progress: 100 });
                onUploaded?.(res.asset);
            } else {
                update(id, { status: "error", error: res.message });
            }
        }
    }, [onUploaded]);

    /** Remove finished/failed rows from the list. */
    const clearFinished = useCallback(() => setItems((prev) => prev.filter((i) => i.status === "uploading")), []);

    return { items, upload, clearFinished };
}
