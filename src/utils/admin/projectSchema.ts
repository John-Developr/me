import { z } from "zod";

import { optionalAssetRef, optionalText, optionalUrl, parsePatch, type PatchParseResult, textList } from "./fieldSchemas";

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

export type ProjectPatch = Partial<ProjectInput>;

/**
 * Validates a PATCH body (any subset of fields, e.g. just `{ status }`).
 * Only keys present in the body are returned (see `parsePatch`).
 */
export const parseProjectPatch = (body: unknown): PatchParseResult<ProjectInput> =>
  parsePatch(projectInputSchema, body);
