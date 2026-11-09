import { SupabaseClient } from "@supabase/supabase-js";

import supabaseServer, { Table } from "../.supabase/server";
import { ServiceError } from "./serviceError";
import { SiteSettingsInput } from "@/utils/admin/siteSettingsSchema";
import { SiteSettings } from "@/utils/types";

const COLUMNS = "favicon_url, updated_at";
const EMPTY: SiteSettings = { favicon_url: null, updated_at: null };

/**
 * SiteSettingsService — the single `site_settings` row (SEO Settings screen).
 *
 * @example
 * const settings = await new SiteSettingsService(session.client).get();
 */
export default class SiteSettingsService {
  constructor(private client: SupabaseClient) {}

  async get(): Promise<SiteSettings> {
    const { data, error } = await this.client.from(Table.siteSettings).select(COLUMNS).eq("id", true).maybeSingle<SiteSettings>();
    if (error) throw SiteSettingsService.fail("load", error.message);
    return data ?? EMPTY;
  }

  /** Saves the settings (creates the row if it's missing). */
  async update(input: SiteSettingsInput): Promise<SiteSettings> {
    const { data, error } = await this.client
      .from(Table.siteSettings)
      .upsert({ id: true, ...input })
      .select(COLUMNS)
      .single<SiteSettings>();
    if (error) throw SiteSettingsService.fail("save", error.message);
    return data;
  }

  /** For the public site's metadata (service role). Throws on database errors. */
  static async getPublic(): Promise<SiteSettings> {
    const { data, error } = await supabaseServer.from(Table.siteSettings).select(COLUMNS).eq("id", true).maybeSingle<SiteSettings>();
    if (error) {
      console.error("[SiteSettingsService] getPublic failed:", error.message);
      throw new Error("Failed to load site settings.");
    }
    return data ?? EMPTY;
  }

  private static fail(action: string, message: string): ServiceError {
    console.error(`[SiteSettingsService] ${action} failed:`, message);
    if (/does not exist|could not find/i.test(message)) {
      return new ServiceError("Site settings aren't set up yet. Run supabase/migrations/20261115000100_site_settings.sql.", 503);
    }
    if (/row-level security|permission/i.test(message)) return new ServiceError("You don't have permission to change settings.", 403);
    return new ServiceError(`Couldn't ${action} the settings. Please try again.`, 500);
  }
}
