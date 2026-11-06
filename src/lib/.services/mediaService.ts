import { randomUUID } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

import { RPC, Table } from "../.supabase/server";
import { ServiceError } from "./serviceError";
import { isSitePath } from "@/utils/admin/fieldSchemas";
import {
  buildObjectPath, DEFAULT_STORAGE_LIMIT_MB, detectMime, formatBytes,
  MAX_UPLOAD_BYTES, MEDIA_BUCKET, MediaMime,
} from "@/utils/media";
import { MediaAsset, MediaImportResult, MediaUsage, StorageUsage } from "@/utils/types";

type AssetRow = Omit<MediaAsset, "url" | "usages">;

const COLUMNS = "id, path, file_name, mime_type, size_bytes, width, height, alt_text, source_path, created_at";

/** Content fields that can point at a media file. Used for "Used by" and the import. */
const REFERENCES = [
  { table: Table.projects,    column: "logo_url",   label: (r: Ref) => `Project “${r.title}” · logo`,       href: (r: Ref) => `/admin/projects/${r.id}/edit` },
  { table: Table.projects,    column: "image_url",  label: (r: Ref) => `Project “${r.title}” · screenshot`, href: (r: Ref) => `/admin/projects/${r.id}/edit` },
  { table: Table.profiles,    column: "avatar_url", label: () => "Profile · photo",                         href: () => "/admin/profile" },
  { table: Table.profiles,    column: "resume_url", label: () => "Profile · resume",                        href: () => "/admin/profile" },
  { table: Table.experiences, column: "logo_url",   label: (r: Ref) => `Experience “${r.position}” · logo`, href: (r: Ref) => `/admin/experience/${r.id}/edit` },
] as const;

interface Ref {
  id:        string;
  title?:    string;
  position?: string;
  value:     string;
}

/** Storage limit from MEDIA_STORAGE_LIMIT_MB (server env), default 1 GB. */
export function storageLimitBytes(): number {
  const mb = Number(process.env.MEDIA_STORAGE_LIMIT_MB);
  return (Number.isFinite(mb) && mb > 0 ? mb : DEFAULT_STORAGE_LIMIT_MB) * 1024 * 1024;
}

/**
 * MediaService — files in the Supabase Storage bucket "media" and their
 * `media_assets` records.
 *
 * Uses the signed-in admin's client: Storage and table policies only let
 * admins write. Files are checked by their real type (magic bytes), size
 * and the storage limit before upload.
 *
 * @example
 * const service = new MediaService(session.client);
 * const asset   = await service.upload({ bytes, originalName: "logo.png" });
 */
export default class MediaService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Public URL of a stored file. */
  url(path: string): string {
    return this.client.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  /** Every file, newest first, with where it's used. */
  async list(): Promise<MediaAsset[]> {
    const [{ data, error }, usages] = await Promise.all([
      this.client.from(Table.mediaAssets).select(COLUMNS).order("created_at", { ascending: false }).returns<AssetRow[]>(),
      this.usageMap(),
    ]);

    if (error) throw this.fail("load the media library", error.message);
    return (data ?? []).map((row) => this.toAsset(row, usages));
  }

  /** Bytes used in the bucket (from Storage itself) and the configured limit. */
  async storageUsage(): Promise<StorageUsage> {
    const limitBytes = storageLimitBytes();
    const { data, error } = await this.client.rpc(RPC.mediaStorageUsage).maybeSingle<{ total_bytes: number; file_count: number }>();

    if (!error && data) {
      return { usedBytes: Number(data.total_bytes), fileCount: Number(data.file_count), limitBytes };
    }

    // Fallback: sum of our records (same files, unless something was added outside the admin).
    const { data: rows, error: rowsError } = await this.client.from(Table.mediaAssets).select("size_bytes");
    if (rowsError) throw this.fail("read storage usage", rowsError.message);

    return {
      usedBytes:  (rows ?? []).reduce((sum, r: { size_bytes: number }) => sum + Number(r.size_bytes), 0),
      fileCount:  rows?.length ?? 0,
      limitBytes,
    };
  }

  /**
   * Validates and stores one file.
   *
   * @param input.bytes        - File contents
   * @param input.originalName - Name shown in the library
   * @param input.width/height - Image size measured in the browser (optional)
   * @param input.sourcePath   - Original /public path (import only)
   */
  async upload(input: {
    bytes: Uint8Array;
    originalName: string;
    width?: number | null;
    height?: number | null;
    sourcePath?: string;
  }): Promise<MediaAsset> {
    const size = input.bytes.byteLength;

    if (size === 0) throw new ServiceError("The file is empty.", 400);
    if (size > MAX_UPLOAD_BYTES) {
      throw new ServiceError(`Files can be up to ${formatBytes(MAX_UPLOAD_BYTES)}. This one is ${formatBytes(size)}.`, 413);
    }

    const mime = detectMime(input.bytes);
    if (!mime) throw new ServiceError("Only PNG, JPEG, WebP, GIF, AVIF images and PDF files are allowed.", 415);

    const usage = await this.storageUsage();
    if (usage.usedBytes + size > usage.limitBytes) {
      throw new ServiceError(
        `Storage limit reached: ${formatBytes(usage.usedBytes)} of ${formatBytes(usage.limitBytes)} used. Delete unused files first.`,
        413,
      );
    }

    const id   = randomUUID();
    const path = buildObjectPath(input.originalName, mime, id);

    const { error: uploadError } = await this.client.storage
      .from(MEDIA_BUCKET)
      .upload(path, input.bytes, { contentType: mime, cacheControl: "31536000", upsert: false });

    if (uploadError) throw this.fail("upload the file", uploadError.message);

    const { data, error } = await this.client
      .from(Table.mediaAssets)
      .insert({
        id,
        path,
        file_name:   input.originalName.slice(0, 255) || `file.${mime.split("/")[1]}`,
        mime_type:   mime,
        size_bytes:  size,
        width:       this.dimension(input.width, mime),
        height:      this.dimension(input.height, mime),
        source_path: input.sourcePath ?? null,
      })
      .select(COLUMNS)
      .single<AssetRow>();

    if (error) {
      // Don't leave an untracked file using storage.
      await this.client.storage.from(MEDIA_BUCKET).remove([path]);
      throw this.fail("save the file record", error.message);
    }

    return this.toAsset(data, new Map());
  }

  async updateAlt(id: string, altText: string | null): Promise<MediaAsset> {
    const { data, error } = await this.client
      .from(Table.mediaAssets)
      .update({ alt_text: altText })
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle<AssetRow>();

    if (error) throw this.fail("update the file", error.message);
    if (!data)  throw new ServiceError("File not found.", 404);

    return this.toAsset(data, await this.usageMap());
  }

  /** Deletes a file that nothing uses (in-use files are refused, with the list of usages). */
  async remove(id: string): Promise<void> {
    const { data: row, error } = await this.client
      .from(Table.mediaAssets)
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle<AssetRow>();

    if (error) throw this.fail("load the file", error.message);
    if (!row)  throw new ServiceError("File not found.", 404);

    const asset = this.toAsset(row, await this.usageMap());
    if (asset.usages.length) {
      throw new ServiceError(
        `This file is in use (${asset.usages.map((u) => u.label).join("; ")}). Replace it there first.`,
        409,
      );
    }

    const { error: storageError } = await this.client.storage.from(MEDIA_BUCKET).remove([row.path]);
    if (storageError) throw this.fail("delete the file", storageError.message);

    const { error: deleteError } = await this.client.from(Table.mediaAssets).delete().eq("id", id);
    if (deleteError) throw this.fail("delete the file record", deleteError.message);
  }

  /**
   * Uploads every /public file that content currently points to (e.g.
   * "/images/NativeCamp.png") and repoints that content to the library copy.
   * Files already imported are reused, so running it again is safe.
   *
   * @param origin - This site's origin, used to download the /public files
   */
  async importSiteImages(origin: string): Promise<MediaImportResult> {
    const refs   = await this.collectRefs();
    const paths  = [...new Set(refs.filter((r) => isSitePath(r.value)).map((r) => r.value))];
    const result: MediaImportResult = { imported: [], reused: [], skipped: [], references: 0 };
    const urlFor = new Map<string, string>();

    for (const sitePath of paths) {
      const { data: existing } = await this.client
        .from(Table.mediaAssets)
        .select("path")
        .eq("source_path", sitePath)
        .maybeSingle<{ path: string }>();

      if (existing) {
        urlFor.set(sitePath, this.url(existing.path));
        result.reused.push(sitePath);
        continue;
      }

      try {
        const res = await fetch(new URL(sitePath, origin), { cache: "no-store" });
        if (!res.ok) throw new ServiceError(`Not found on the site (${res.status}).`, 404);

        const bytes = new Uint8Array(await res.arrayBuffer());
        const asset = await this.upload({
          bytes,
          originalName: decodeURIComponent(sitePath.split("/").pop() ?? "file"),
          sourcePath:   sitePath,
        });

        urlFor.set(sitePath, asset.url);
        result.imported.push(sitePath);
      } catch (error) {
        result.skipped.push({ path: sitePath, reason: error instanceof Error ? error.message : "Unknown error." });
      }
    }

    // Repoint content to the library copies (activity log records each change).
    for (const ref of REFERENCES) {
      for (const [sitePath, url] of urlFor) {
        const { data, error } = await this.client
          .from(ref.table)
          .update({ [ref.column]: url })
          .eq(ref.column, sitePath)
          .select("id");

        if (error) {
          result.skipped.push({ path: sitePath, reason: `Couldn't update ${ref.table}.${ref.column}: ${error.message}` });
        } else {
          result.references += data?.length ?? 0;
        }
      }
    }

    return result;
  }

  // ─── Helpers ─────────────────────────────────────────────

  private toAsset(row: AssetRow, usages: Map<string, MediaUsage[]>): MediaAsset {
    const url = this.url(row.path);
    return {
      ...row,
      size_bytes: Number(row.size_bytes),
      url,
      usages: [...(usages.get(url) ?? []), ...(row.source_path ? usages.get(row.source_path) ?? [] : [])],
    };
  }

  /** Only images have dimensions; ignore anything that isn't a sane integer. */
  private dimension(value: number | null | undefined, mime: MediaMime): number | null {
    if (!mime.startsWith("image/") || value == null) return null;
    return Number.isInteger(value) && value > 0 && value <= 20000 ? value : null;
  }

  /** Every content field that references a file, with a label and admin link. */
  private async collectRefs(): Promise<(Ref & { label: string; href: string })[]> {
    const [projects, profiles, experiences] = await Promise.all([
      this.client.from(Table.projects).select("id, title, logo_url, image_url"),
      this.client.from(Table.profiles).select("id, avatar_url, resume_url"),
      this.client.from(Table.experiences).select("id, position, logo_url"),
    ]);

    for (const r of [projects, profiles, experiences]) {
      if (r.error) throw this.fail("check where files are used", r.error.message);
    }

    const rowsByTable: Record<string, Record<string, string | null>[]> = {
      [Table.projects]:    projects.data ?? [],
      [Table.profiles]:    profiles.data ?? [],
      [Table.experiences]: experiences.data ?? [],
    };

    return REFERENCES.flatMap((ref) =>
      rowsByTable[ref.table]
        .filter((row) => row[ref.column])
        .map((row) => {
          const r: Ref = { id: String(row.id), title: row.title ?? undefined, position: row.position ?? undefined, value: String(row[ref.column]) };
          return { ...r, label: ref.label(r), href: ref.href(r) };
        }),
    );
  }

  /** value (URL or /public path) → where it's used. */
  private async usageMap(): Promise<Map<string, MediaUsage[]>> {
    const map = new Map<string, MediaUsage[]>();
    for (const ref of await this.collectRefs()) {
      map.set(ref.value, [...(map.get(ref.value) ?? []), { label: ref.label, href: ref.href }]);
    }
    return map;
  }

  private fail(action: string, detail: string): ServiceError {
    console.error(`[MediaService] ${action} failed:`, detail);
    if (/row-level security|permission|unauthorized/i.test(detail)) {
      return new ServiceError("You don't have permission to manage media.", 403);
    }
    if (/bucket not found/i.test(detail)) {
      return new ServiceError("The media bucket doesn't exist yet. Run the Media Library migration.", 500);
    }
    return new ServiceError(`Couldn't ${action}. Please try again.`, 500);
  }
}
