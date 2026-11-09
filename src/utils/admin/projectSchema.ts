import { z } from "zod";

import { optionalAssetRef, optionalText, optionalUrl, textList } from "./fieldSchemas";

/* ============================================================
   PROJECT VALIDATION
   ------------------------------------------------------------
   One schema for the admin form (client) and the API (server).
   Limits match the CHECK constraints in the migrations.
   Images must be site paths (/images/...) until the Media
   Library exists — next/image only serves configured hosts.
   ============================================================ */

/** Same pattern as the `projects.slug` CHECK constraint. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const PROJECT_KINDS = ["Professional Work", "Personal Project", "Academic Project"] as const;

export const PROJECT_LIMITS = {
  highlights: 6,
  highlight:  200,
  tech:       20,
  techName:   40,
} as const;

export const projectInputSchema = z.object({
  title:        z.string().trim().min(1, "Title is required.").max(160, "Title must be 160 characters or fewer."),
  slug:         z.string().trim().min(1, "Slug is required.").max(120, "Slug must be 120 characters or fewer.")
                  .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens (e.g. my-project)."),
  tagline:      optionalText(200, "Tagline"),
  description:  optionalText(5000, "Description"),
  kind:         z.enum(PROJECT_KINDS).nullable().optional().transform((v) => v ?? null),
  role:         optionalText(120, "Role"),
  organization: optionalText(160, "Organization"),
  period:       optionalText(60, "Period"),
  highlights:   textList(PROJECT_LIMITS.highlights, PROJECT_LIMITS.highlight, "highlight"),
  tech:         textList(PROJECT_LIMITS.tech, PROJECT_LIMITS.techName, "technology"),
  logo_url:     optionalAssetRef("Logo"),
  image_url:    optionalAssetRef("Screenshot"),
  live_url:     optionalUrl("Live site URL"),
  live_label:   optionalText(40, "Live link label"),
  source_url:   optionalUrl("Source code URL"),
  source_label: optionalText(40, "Source link label"),
  note:         optionalText(200, "Note"),
  status:       z.enum(["draft", "published"]).default("draft"),
  is_featured:  z.boolean().default(false),
  sort_order:   z.coerce.number().int("Display order must be a whole number.").min(0).max(9999).default(0),
});

export type ProjectInput = z.output<typeof projectInputSchema>;

const projectPatchSchema = projectInputSchema.partial();

export type ProjectPatch = Partial<ProjectInput>;

export type PatchParseResult =
  | { success: true;  data: ProjectPatch }
  | { success: false; error: z.ZodError };

/**
 * Validates a PATCH body (any subset of fields, e.g. just `{ status }`).
 *
 * Only keys present in the body are returned: zod applies `.default()`
 * values even inside `.partial()`, which would otherwise reset fields
 * like `highlights` or `is_featured` that weren't sent.
 */
export function parseProjectPatch(body: unknown): PatchParseResult {
  const parsed = projectPatchSchema.safeParse(body);
  if (!parsed.success) return parsed;

  const sent = new Set(body && typeof body === "object" ? Object.keys(body) : []);
  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([key]) => sent.has(key)),
  ) as ProjectPatch;

  return { success: true, data };
}
