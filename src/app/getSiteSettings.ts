import { cache } from "react";

import SiteSettingsService from "@/lib/.services/siteSettingsService";
import { SiteSettings } from "@/utils/types";

/**
 * Site settings for metadata (favicon), loaded once per request.
 * Never throws: if they can't be loaded, defaults in code are used.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> =>
  SiteSettingsService.getPublic().catch(() => ({ favicon_url: null, updated_at: null }))
);
