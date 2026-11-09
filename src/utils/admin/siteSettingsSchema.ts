import { z } from "zod";

import { optionalAssetRef } from "./fieldSchemas";

/** SEO Settings form ↔ API. Empty favicon = use the default /favicon.ico. */
export const siteSettingsSchema = z.object({
  favicon_url: optionalAssetRef("Site icon").refine(
    (v) => v === null || !/\.pdf($|\?)/i.test(v),
    "The site icon must be an image, not a PDF.",
  ),
});

export type SiteSettingsInput = z.output<typeof siteSettingsSchema>;

/** Used when no icon is set (and when settings can't be loaded). */
export const DEFAULT_FAVICON = "/favicon.ico";
