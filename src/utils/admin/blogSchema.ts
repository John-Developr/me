import { z } from "zod";

import { parsePatch, type PatchParseResult, textList } from "./fieldSchemas";
import { SLUG_PATTERN } from "./projectSchema";

/* ============================================================
   BLOG POST VALIDATION
   ------------------------------------------------------------
   One schema for the admin blog form (client) and the API (server).
   Categories match BlogCategoryEnum (minus "All") and the values
   the public blog filters on. Reading time is computed on save.
   ============================================================ */

export const BLOG_CATEGORIES = ["technology", "study", "life", "future"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  technology: "Technology",
  study:      "Study",
  life:       "Life",
  future:     "Future",
};

export const BLOG_STATUSES = ["draft", "published"] as const;
export const BLOG_SOURCES  = ["ai", "personal"] as const;

export const BLOG_LIMITS = {
  title:   160,
  slug:    120,
  excerpt: 500,   // prompt asks for 30–50 words; leave headroom so AI drafts always save
  content: 50000,
  tags:    8,
  tag:     40,
} as const;

export const blogInputSchema = z.object({
  title:    z.string().trim().min(1, "Title is required.")
              .max(BLOG_LIMITS.title, `Title must be ${BLOG_LIMITS.title} characters or fewer.`),
  slug:     z.string().trim().min(1, "Slug is required.")
              .max(BLOG_LIMITS.slug, `Slug must be ${BLOG_LIMITS.slug} characters or fewer.`)
              .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens (e.g. my-post)."),
  category: z.enum(BLOG_CATEGORIES, "Choose a category."),
  excerpt:  z.string().trim().min(1, "Excerpt is required.")
              .max(BLOG_LIMITS.excerpt, `Excerpt must be ${BLOG_LIMITS.excerpt} characters or fewer.`),
  content:  z.string().trim().min(1, "Content is required.")
              .max(BLOG_LIMITS.content, `Content must be ${BLOG_LIMITS.content} characters or fewer.`),
  tags:     textList(BLOG_LIMITS.tags, BLOG_LIMITS.tag, "tag"),
  status:   z.enum(BLOG_STATUSES).default("draft"),
  source:   z.enum(BLOG_SOURCES).default("personal"),
});

export type BlogInput = z.output<typeof blogInputSchema>;
export type BlogPatch = Partial<BlogInput>;

/** Validates a PATCH body (any subset of fields). Only sent keys are returned. */
export const parseBlogPatch = (body: unknown): PatchParseResult<BlogInput> =>
  parsePatch(blogInputSchema, body);

/** Body of "Generate with AI": which category to write about. */
export const blogGenerateSchema = z.object({
  category: z.enum(BLOG_CATEGORIES, "Choose a category."),
});
