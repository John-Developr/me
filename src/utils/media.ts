import { slugify } from "@/utils/general/stringHelpers";

/* ============================================================
   MEDIA LIBRARY HELPERS (shared by client and server)
   ------------------------------------------------------------
   Files live in the public Supabase Storage bucket "media".
   Limits match supabase/migrations/20261110000100_media_library.sql.
   ============================================================ */

export const MEDIA_BUCKET = "media";

/** 4 MB — Vercel rejects request bodies over 4.5 MB. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Default storage limit when MEDIA_STORAGE_LIMIT_MB isn't set (Supabase Free plan: 1 GB). */
export const DEFAULT_STORAGE_LIMIT_MB = 1024;

export const MEDIA_TYPES = {
  "image/png":       { ext: "png",  label: "PNG"  },
  "image/jpeg":      { ext: "jpg",  label: "JPEG" },
  "image/webp":      { ext: "webp", label: "WebP" },
  "image/gif":       { ext: "gif",  label: "GIF"  },
  "image/avif":      { ext: "avif", label: "AVIF" },
  "application/pdf": { ext: "pdf",  label: "PDF"  },
} as const;

export type MediaMime = keyof typeof MEDIA_TYPES;

export const MEDIA_MIMES = Object.keys(MEDIA_TYPES) as MediaMime[];

/** For <input accept>. */
export const MEDIA_ACCEPT = MEDIA_MIMES.join(",");

export const isImageMime = (mime: string): boolean => mime.startsWith("image/");

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((b, i) => bytes[offset + i] === b);

const ascii = (bytes: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...bytes.slice(from, to));

/**
 * The real file type from its first bytes ("magic numbers"), or null when
 * it isn't an allowed type. The browser-reported type and the extension are
 * not trusted.
 */
export function detectMime(bytes: Uint8Array): MediaMime | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff]))                               return "image/jpeg";
  if (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a")  return "image/gif";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP")     return "image/webp";
  if (ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12))) return "image/avif";
  if (ascii(bytes, 0, 5) === "%PDF-")                                       return "application/pdf";
  return null;
}

/** 1536 → "1.5 KB"; 1288490188 → "1.2 GB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit  = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit  += 1;
  }
  return `${value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${units[unit]}`;
}

/** Bytes → GB with two decimals, for the storage gauge ("0.12 GB"). */
export const toGB = (bytes: number): string => (bytes / 1024 ** 3).toFixed(2);

/**
 * Storage key: "2026/11/<id>-<slug>.<ext>". The id keeps names unique;
 * the slug keeps URLs readable. The extension follows the detected type.
 */
export function buildObjectPath(originalName: string, mime: MediaMime, id: string, now: Date = new Date()): string {
  const base = slugify(originalName.replace(/\.[^.]+$/, ""), 60) || "file";
  const yyyy = now.getUTCFullYear();
  const mm   = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}/${mm}/${id}-${base}.${MEDIA_TYPES[mime].ext}`;
}

/** Public URL prefix of the media bucket, e.g. https://x.supabase.co/storage/v1/object/public/media/ */
export const mediaPublicBase = (supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL): string | null =>
  supabaseUrl ? `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/` : null;

/** True for a URL of a file in this project's media bucket. */
export function isMediaUrl(value: string, supabaseUrl?: string): boolean {
  const base = mediaPublicBase(supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!base || !value.startsWith(base)) return false;
  const path = value.slice(base.length);
  return path.length > 0 && !path.includes("..") && !/[\s\\?#]/.test(path);
}
