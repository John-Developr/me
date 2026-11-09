import { cache } from "react";

import SiteSettingsService, { EMPTY_SETTINGS } from "@/lib/.services/siteSettingsService";
import { SeoSettingsData } from "@/utils/types";

/** SEO settings for metadata, loaded once per request. Throws on database errors. */
export const getSeoSettings = cache(async (): Promise<SeoSettingsData> => SiteSettingsService.getPublic());

/** Same, but never throws (used by the root layout, which also serves the admin). */
export const getSeoSettingsSafe = cache(async (): Promise<SeoSettingsData> =>
  getSeoSettings().catch(() => ({ settings: EMPTY_SETTINGS, pages: [] }))
);
