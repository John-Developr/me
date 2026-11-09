import { SupabaseClient } from "@supabase/supabase-js";

import supabaseServer, { Table } from "../.supabase/server";
import { ServiceError } from "./serviceError";
import { SeoSettingsInput } from "@/utils/admin/siteSettingsSchema";
import { SeoPage, SeoSettingsData, SiteSettings } from "@/utils/types";

const SETTINGS_COLUMNS = "favicon_url, site_name, twitter_handle, google_verification, allow_indexing, updated_at";
const PAGE_COLUMNS     = "key, title, description, keywords, share_image_url, updated_at";

export const EMPTY_SETTINGS: SiteSettings = {
  favicon_url: null, site_name: null, twitter_handle: null, google_verification: null, allow_indexing: true, updated_at: null,
};

/**
 * SiteSettingsService — SEO Settings: the single `site_settings` row and
 * the per-page `seo_pages` rows.
 *
 * @example
 * const { settings, pages } = await new SiteSettingsService(session.client).get();
 */
export default class SiteSettingsService {
  constructor(private client: SupabaseClient) {}

  async get(): Promise<SeoSettingsData> {
    return SiteSettingsService.read(this.client, (msg) => SiteSettingsService.fail("load", msg));
  }

  /** Saves site-wide settings and every page sent (one request from the form). */
  async update(input: SeoSettingsInput): Promise<SeoSettingsData> {
    const { error } = await this.client.from(Table.siteSettings).upsert({ id: true, ...input.settings });
    if (error) throw SiteSettingsService.fail("save", error.message);

    if (input.pages.length) {
      const { error: pagesError } = await this.client.from(Table.seoPages).upsert(input.pages);
      if (pagesError) throw SiteSettingsService.fail("save", pagesError.message);
    }

    return this.get();
  }

  /** For page metadata (service role). Throws on database errors. */
  static async getPublic(): Promise<SeoSettingsData> {
    return SiteSettingsService.read(supabaseServer, (msg) => {
      console.error("[SiteSettingsService] getPublic failed:", msg);
      return new Error("Failed to load site settings.");
    });
  }

  private static async read(client: SupabaseClient, onError: (message: string) => Error): Promise<SeoSettingsData> {
    const [settings, pages] = await Promise.all([
      client.from(Table.siteSettings).select(SETTINGS_COLUMNS).eq("id", true).maybeSingle<SiteSettings>(),
      client.from(Table.seoPages).select(PAGE_COLUMNS).returns<SeoPage[]>(),
    ]);
    if (settings.error) throw onError(settings.error.message);
    if (pages.error)    throw onError(pages.error.message);
    return { settings: settings.data ?? EMPTY_SETTINGS, pages: pages.data ?? [] };
  }

  private static fail(action: string, message: string): ServiceError {
    console.error(`[SiteSettingsService] ${action} failed:`, message);
    if (/does not exist|could not find/i.test(message)) {
      return new ServiceError("SEO settings aren't set up yet. Run supabase/migrations/20261116000100_seo_settings.sql.", 503);
    }
    if (/row-level security|permission/i.test(message)) return new ServiceError("You don't have permission to change settings.", 403);
    if (/check constraint/i.test(message)) return new ServiceError("One of the values isn't valid. Check the highlighted fields.", 400);
    return new ServiceError(`Couldn't ${action} the settings. Please try again.`, 500);
  }
}
