import { z } from "zod";

import { optionalAssetRef, optionalText } from "./fieldSchemas";
import { SEO_PAGE_KEYS } from "./seoPages";

/* ============================================================
   SEO SETTINGS VALIDATION
   ------------------------------------------------------------
   Shared by the SEO Settings form and the API. Limits match the
   CHECK constraints on site_settings and seo_pages. Titles may be
   up to 70 characters and descriptions 200 (Google usually shows
   about 60 / 160; the form warns past that).
   ============================================================ */

/** Used when no icon is set (and when settings can't be loaded). */
export const DEFAULT_FAVICON = "/favicon.ico";

/** "johncarlo_dev", "@johncarlo_dev" or an x.com/twitter.com URL → "@johncarlo_dev". */
export function normalizeHandle(raw: string): string {
  const v = raw.trim().replace(/^(https?:\/\/)?(www\.)?(x|twitter)\.com\//i, "").replace(/[/?#].*$/, "");
  return v ? `@${v.replace(/^@/, "")}` : "";
}

/** Accepts the code or the whole Search Console meta tag; returns just the code. */
export function extractVerification(raw: string): string {
  const v = raw.trim();
  return v.match(/content=["']([^"']+)["']/i)?.[1] ?? v;
}

const pageSchema = z.object({
  key:         z.enum(SEO_PAGE_KEYS),
  title:       z.string().trim().min(1, "Enter a title.").max(70, "Keep titles to 70 characters or fewer."),
  description: z.string().trim().min(1, "Enter a description.").max(200, "Keep descriptions to 200 characters or fewer."),
  keywords:    z.array(z.string().trim().max(60, "Each keyword must be 60 characters or fewer."))
                 .max(20, "Up to 20 keywords.")
                 .transform((k) => [...new Set(k.filter(Boolean))])
                 .default([]),
  share_image_url: optionalAssetRef("Share image").refine(
    (v) => v === null || !/\.pdf($|\?)/i.test(v),
    "The share image must be an image, not a PDF.",
  ),
});

export const siteSettingsSchema = z.object({
  favicon_url:  optionalAssetRef("Site icon").refine(
    (v) => v === null || !/\.pdf($|\?)/i.test(v),
    "The site icon must be an image, not a PDF.",
  ),
  site_name:    z.string().trim().min(1, "Enter your site name.").max(60, "Keep the site name to 60 characters or fewer."),
  twitter_handle: z.preprocess(
    (v) => (typeof v === "string" ? normalizeHandle(v) : v),
    optionalText(16, "X handle").refine((v) => v === null || /^@[A-Za-z0-9_]{1,15}$/.test(v), "Use your X username, e.g. @johncarlo_dev."),
  ),
  google_verification: z.preprocess(
    (v) => (typeof v === "string" ? extractVerification(v) : v),
    optionalText(100, "Verification code").refine((v) => v === null || /^[A-Za-z0-9_-]{10,100}$/.test(v), "Paste the code (or the whole meta tag) from Google Search Console."),
  ),
  allow_indexing: z.boolean().default(true),
});

export const seoSettingsSchema = z.object({
  settings: siteSettingsSchema,
  pages:    z.array(pageSchema).max(SEO_PAGE_KEYS.length),
});

export type SeoSettingsInput  = z.output<typeof seoSettingsSchema>;
