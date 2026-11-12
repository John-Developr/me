import { z } from "zod";

import { optionalMediaRef, optionalText } from "./fieldSchemas";
import { SKILL_ICON_KEYS } from "./skillIconKeys";

/* ============================================================
   SKILLS VALIDATION
   ------------------------------------------------------------
   Shared by the Skills admin dialogs and the API. Limits match
   the CHECK constraints on skills / skill_categories.
   ============================================================ */

const order = z.coerce.number().int("Use a whole number.").min(0).max(9999).default(0);

export const skillInputSchema = z.object({
  name:        z.string().trim().min(1, "Name is required.").max(80, "Use 80 characters or fewer."),
  category_id: z.preprocess((v) => (v === "" ? null : v), z.uuid("Choose a category.").nullable()),
  logo_url:    optionalMediaRef("Logo"),
  is_core:     z.boolean().default(false),
  description: optionalText(160, "Description"),
  core_order:  order,
  is_current:  z.boolean().default(false),
  sort_order:  order,
}).superRefine((d, ctx) => {
  if (d.is_core && !d.description) {
    ctx.addIssue({ code: "custom", path: ["description"], message: "Core tools need a one-line description." });
  }
});

export type SkillInput = z.output<typeof skillInputSchema>;

/** "Cloud & DevOps" → "cloud-devops" (stable id for the page markup). */
export const categorySlug = (name: string): string =>
  name.toLowerCase().normalize("NFKD").replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "category";

export const categoryInputSchema = z.object({
  name:        z.string().trim().min(1, "Name is required.").max(80, "Use 80 characters or fewer."),
  description: optionalText(300, "Description"),
  icon:        z.enum(SKILL_ICON_KEYS).default("category"),
  sort_order:  order,
}).transform((d) => ({ ...d, slug: categorySlug(d.name) }));

export type CategoryInput = z.output<typeof categoryInputSchema>;

/** Body of PUT /api/admin/skills/core-order: every Core Stack skill id, in display order. */
export const coreOrderSchema = z.object({
  ids: z.array(z.uuid("Invalid skill id."))
    .min(1, "Nothing to reorder.")
    .max(500, "Too many skills.")
    .refine((ids) => new Set(ids).size === ids.length, "Each skill can appear only once."),
});

export type CoreOrderInput = z.output<typeof coreOrderSchema>;
