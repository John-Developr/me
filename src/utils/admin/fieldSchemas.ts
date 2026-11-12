import { z } from "zod";

import { isMediaUrl } from "@/utils/media";

/* ============================================================
   SHARED FIELD SCHEMAS (admin forms)
   ------------------------------------------------------------
   Building blocks used by the project and profile schemas.
   Empty strings become null, so the database stores NULL.
   ============================================================ */

/** Same rule as the admin image inputs: a path on this site, no traversal. */
export const SITE_PATH_PATTERN = /^\/[^/\\\s][^\s\\]*$/;

export const isSitePath = (value: string): boolean => SITE_PATH_PATTERN.test(value) && !value.includes("..");

/** An image/document reference: a Media Library URL or a path in /public. */
export const isAssetRef = (value: string): boolean => isMediaUrl(value) || isSitePath(value);

/** Trimmed string; empty → null (stored as NULL, not ""). */
export const optionalText = (max: number, label: string) =>
  z.string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const optionalUrl = (label: string) =>
  optionalText(2048, label).refine(
    (v) => v === null || /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v),
    `${label} must start with http:// or https://.`,
  );

/** A Media Library file, or a path in /public (e.g. /images/logo.png). */
export const optionalAssetRef = (label: string) =>
  optionalText(2048, label).refine(
    (v) => v === null || isAssetRef(v),
    `${label} must be a Media Library file or a path on this site, like /images/logo.png.`,
  );

/** A Media Library file only (no /public paths), e.g. skill logos. */
export const optionalMediaRef = (label: string) =>
  optionalText(2048, label).refine(
    (v) => v === null || isMediaUrl(v),
    `${label} must be a file from the Media Library.`,
  );

export const textList = (maxItems: number, maxLength: number, label: string) =>
  z.array(z.string().trim().max(maxLength, `Each ${label} must be ${maxLength} characters or fewer.`))
    .max(maxItems, `Up to ${maxItems} ${label}s.`)
    .transform((items) => [...new Set(items.filter(Boolean))])
    .default([]);

export type PatchParseResult<T> =
  | { success: true;  data: Partial<T> }
  | { success: false; error: z.ZodError };

/**
 * Validates a PATCH body (any subset of fields, e.g. just `{ status }`)
 * against an input schema.
 *
 * Only keys present in the body are returned: zod applies `.default()`
 * values even inside `.partial()`, which would otherwise reset fields
 * that weren't sent.
 */
export function parsePatch<S extends z.ZodObject>(schema: S, body: unknown): PatchParseResult<z.output<S>> {
  const parsed = schema.partial().safeParse(body);
  if (!parsed.success) return { success: false, error: parsed.error };

  const sent = new Set(body && typeof body === "object" ? Object.keys(body) : []);
  const data = Object.fromEntries(
    Object.entries(parsed.data as Record<string, unknown>).filter(([key]) => sent.has(key)),
  ) as Partial<z.output<S>>;

  return { success: true, data };
}

